import seedrandom from 'seedrandom'
import Delaunator from 'delaunator'
import Constrainautor from '@kninnug/constrainautor'
import { makeNoise2D } from 'open-simplex-noise'
import { Corners, Layer, OutPacket, Parameters, Vertex2, Vertex3 } from './interfaces'

addEventListener('message', async (evt) => {
    const data: OutPacket = evt.data
    const parameters = data.parameters

    seedrandom(data.seed, { global: true })

    const noisex = makeNoise(makeNoise2D(Math.random() * 100000), parameters.angle.scale, parameters.angle.octaves)
    const noisey = makeNoise(makeNoise2D(Math.random() * 100000), parameters.angle.scale, parameters.angle.octaves)
    const noiseheight = makeNoise(makeNoise2D(Math.random() * 100000), parameters.roughness.scale, parameters.roughness.octaves)
    const noise = makeNoise(makeNoise2D(Math.random() * 100000), parameters.base.scale, parameters.base.octaves)

    function atan2(y: number, x: number): number {
        // See https://github.com/mrdoob/three.js/issues/10766
        var sign: number = 1.0 - (+(y < 0.0) << 1)
        var absYandR: number = y * sign + 2.220446049250313e-16
        var partSignX: number = (+(x < 0.0) << 1) // [0.0/2.0]
        var signX: number = 1.0 - partSignX // [1.0/-1.0]
        absYandR = (x - signX * absYandR) / (signX * x + absYandR)
        return ((partSignX + 1.0) * 0.7853981634 + (0.1821 * absYandR * absYandR - 0.9675) * absYandR) * sign
    }

    function val(x, y) {
        if (x < 0 || y < 0 || x >= parameters.size || y >= parameters.size)
            return 0

        let pixel_height = noiseheight(x, y) / 2 + .5
        let pixel_base = noise(x, y) / 2 + .5

        let angle = atan2(noisey(x, y), noisex(x, y))

        if (angle < -.4)
            angle += Math.PI * 2
        if (angle < 0)
            angle = angle * (Math.PI * 2 / -.4)

        let r = Math.sqrt(Math.pow(x - parameters.size / 2, 2) + Math.pow(y - parameters.size / 2, 2)) / (parameters.size / 2)
        // pixel_base /= 1 + Math.pow(r * 3, 8)
        // pixelh /= 1 + Math.pow(r * 2, 8)

        let pixel = (angle / (Math.PI * 2)) * pixel_height + pixel_base * (1 - pixel_height)
        pixel /= 1 + Math.pow(r * 1.5, 8)
        return pixel
    }

    // Pre-generate values
    let vals: Map<number, number> = new Map()
    let w = parameters.size + 2
    for (let x = -1; x < parameters.size + 1; x++)
        for (let y = -1; y < parameters.size + 1; y++)
            vals.set(x + y * w, val(x, y))

    // Create empty layers
    let layers: Layer[] = []
    for (let height = 0; height < parameters.layer_count; height++) {
        layers.push({
            height: height,
            color: colorgradient(height / parameters.layer_count, data.colors),
            verts: new Set(),
            edges: new Map()
        })
    }
    let pixels = []

    // Add edges to layers (and send pixels to main thread)
    for (let x = 0; x < parameters.size + 1; x++) {
        for (let y = 0; y < parameters.size + 1; y++) {
            let cornervals: Corners = [vals.get((x - 1) + (y - 1) * w), vals.get(x + (y - 1) * w), vals.get(x + y * w), vals.get((x - 1) + y * w)]
            for (let layer of layers) {
                add_edges(layer, cornervals, x, y, parameters)
            }

            if (evt.data.generate_image) {
                let color = colorgradient(cornervals[0], data.colors)
                pixels.push({
                    color: "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")",
                    raw: cornervals[0] * 255,
                    x: parameters.size + 1 - x,
                    y: y - 2
                })
                if (pixels.length == parameters.size + 1) {
                    postMessage({
                        type: "fill_pixels",
                        pixels: pixels
                    })
                    pixels = []
                }

            }
        }
    }

    for (let layer of layers)
        display(layer, parameters)
    let water_level = (randn_bm() * .3 + .1) * parameters.vscale
    water_level -= water_level % (parameters.vscale / parameters.layer_count)
    water_level -= (parameters.vscale / parameters.layer_count) / 2
    postMessage({
        type: "add_water",
        water_level: water_level
    })
})

function interpolate(centered_vert: Vertex2, cornervals: Corners, x: number, y: number, layer: Layer, parameters: Parameters): Vertex2 {
    let vert: Vertex2 = [centered_vert[0] + x, centered_vert[1] + y]
    let v0 = cornervals[0]
    let v1 = cornervals[1]
    let v2 = cornervals[2]
    let v3 = cornervals[3]
    if (vert[0] == x && Math.abs(v0 - v3) == 0)
        console.log("0 diff 1")
    if (vert[0] == x + 1 && Math.abs(v1 - v2) == 0)
        console.log("0 diff 2")
    if (vert[1] == y && Math.abs(v0 - v1) == 0)
        console.log("0 diff 3")
    if (vert[1] == y + 1 && Math.abs(v3 - v2) == 0)
        console.log("0 diff 4")
    function clamp(x) { return Math.max(Math.min(x, .999), .001) }
    if (vert[0] == x && Math.abs(v0 - v3) != 0)
        return [vert[0], (Math.floor(vert[1]) + clamp((v0 - layer.height / parameters.layer_count) / (v0 - v3)))]
    if (vert[0] == x + 1 && Math.abs(v1 - v2) != 0)
        return [vert[0], (Math.floor(vert[1]) + clamp((v1 - layer.height / parameters.layer_count) / (v1 - v2)))]
    if (vert[1] == y && Math.abs(v0 - v1) != 0)
        return [(Math.floor(vert[0]) + clamp((v0 - layer.height / parameters.layer_count) / (v0 - v1))), vert[1]]
    if (vert[1] == y + 1 && Math.abs(v3 - v2) != 0)
        return [(Math.floor(vert[0]) + clamp((v3 - layer.height / parameters.layer_count) / (v3 - v2))), vert[1]]

    console.log("interpolation failed: ", vert)
    return vert
}

function display(layer: Layer, parameters: Parameters) {
    function valid_next(key, start): string {
        if (layer.edges.has(key))
            for (let i = 0; i < layer.edges.get(key).length; i++) {
                if (layer.edges.get(key)[i] != start && layer.edges.has(layer.edges.get(key)[i]))
                    return layer.edges.get(key)[i]
            }
        return null
    }

    let loops = []
    while (layer.edges.size > 0) {
        let loop: string[] = []

        let joint: string = layer.edges.keys().next().value
        let start: string = joint
        loop.push(start)

        let end: string = layer.edges.get(start)[0]
        loop.push(end)

        let other_joint = layer.edges.get(start)[1]

        layer.edges.delete(start)

        while (end != joint) {
            if (!layer.edges.has(end))
                break

            let destination = valid_next(end, start)
            if (destination) {
                start = end
                end = destination
                loop.push(end)
                layer.edges.delete(start)
            } else
                layer.edges.delete(end)
        }

        if (loop[loop.length - 1] != other_joint)
            console.log("loop failed", loop[loop.length - 1], other_joint)


        if (loop.length > 9) {
            let adjusted_loop = process_loop(loop)
            loops.push(adjusted_loop)

            // Debug lines
            // if (loop[loop.length - 1] != other_joint) {
            //     const points = []
            //     points.push(new Vector3(unhash(loop[loop.length - 1])[0] - .5 * parameters.scale, (unhash(loop[loop.length - 1])[1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))
            //     points.push(new Vector3(unhash(other_joint)[0] - .5 * this.parameters.scale, (unhash(other_joint)[1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))
            //     this.debug_line(points, 0xff00ff)
            // }
            // const points = []
            // for (let i = 0; i < adjusted_loop.length; i++) {
            //     points.push(new Vector3(adjusted_loop[i][0] - .5 * this.parameters.scale, (adjusted_loop[i][1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))
            //     points.push(new Vector3(adjusted_loop[(i + 1) % adjusted_loop.length][0] - .5 * this.parameters.scale, (adjusted_loop[(i + 1) % adjusted_loop.length][1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))
            // }
            // this.debug_line(points, 0x0033ff)
        }
    }

    render_layer_mesh(loops, layer, parameters)
}

function render_layer_mesh(loops: Vertex2[][], layer: Layer, parameters: Parameters) {
    if (loops.length == 0)
        return

    let verts: Vertex2[] = []
    let edges: [number, number][] = []

    let seam_verts: Vertex3[] = []
    let seam_tris: number[] = []

    let base_index = 0
    for (let loop of loops) {
        for (let i = 0; i < loop.length; i++) {
            edges.push([i + base_index, (i + 1) % loop.length + base_index])

            seam_verts.push([(loop[i][0] - .5) * parameters.scale, (loop[i][1] - .5) * parameters.scale, parameters.vscale * layer.height / parameters.layer_count])
            seam_verts.push([(loop[i][0] - .5) * parameters.scale, (loop[i][1] - .5) * parameters.scale, parameters.vscale * (layer.height + 1) / parameters.layer_count])

            let seam_base = base_index * 2
            let next_base_index = (i * 2 + 2) % (2 * loop.length) + seam_base
            let next_top_index = (i * 2 + 3) % (2 * loop.length) + seam_base

            seam_tris.push(i * 2 + seam_base, next_base_index, i * 2 + 1 + seam_base)
            seam_tris.push(i * 2 + 1 + seam_base, next_base_index, next_top_index)

        }

        verts = verts.concat(loop)
        base_index += loop.length
    }

    // let triangles_ids: number[] = cdt2d(verts, edges, { exterior: false }).flat()
    let del = Delaunator.from(verts)
    try {
        new Constrainautor(del, edges)
    } catch { }
    let triangles_ids: number[] = []


    // Filter for valid triangles

    // Place edges into bins based on their y value:
    let bins = []
    for (let edge of edges) {
        let y_max = Math.max(verts[edge[0]][1], verts[edge[1]][1]) + .001
        let y_min = Math.min(verts[edge[0]][1], verts[edge[1]][1]) - .001
        for (let y = Math.floor(y_min); y <= y_max; y++) {
            if (bins[y] == undefined)
                bins[y] = []
            bins[y].push(edge)
        }
    }

    // Remove all triangles that cross an even number of edges exiting the polygon
    for (let i = 0; i < del.triangles.length; i += 3) {
        let center_x = (verts[del.triangles[i]][0] + verts[del.triangles[i + 1]][0] + verts[del.triangles[i + 2]][0]) / 3
        let center_y = (verts[del.triangles[i]][1] + verts[del.triangles[i + 1]][1] + verts[del.triangles[i + 2]][1]) / 3
        // Count number of intersections with a line going right to infinity
        let intersections = 0
        for (let edge of bins[Math.floor(center_y)] ?? []) {
            // https://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/
            let a = verts[edge[0]]
            let b = verts[edge[1]]

            // Edge cases probably dont help with bins method
            // if ((a[0] < center_x && b[0] < center_x) || (a[1] < center_y && b[1] < center_y) || (a[1] < center_y && b[1] < center_y))
            //     continue


            // let v1 = [center_x - a[0], center_y - a[1]]
            // let v2 = [b[0]- a[0], b[1] - a[1]]
            // let v3 = [0, 1]

            let v2dotv3 = b[1] - a[1]
            let t1 = ((b[0] - a[0]) * (center_y - a[1]) - (b[1] - a[1]) * (center_x - a[0])) / v2dotv3
            let t2 = (center_y - a[1]) / v2dotv3

            if (t1 > 0 && t2 > 0 && t2 <= 1)
                intersections++
        }


        if (intersections % 2 == 0) {
            continue
        }

        center_x = (verts[del.triangles[i]][0] * .9 + verts[del.triangles[i + 1]][0] * 1.1 + verts[del.triangles[i + 2]][0]) / 3
        center_y = (verts[del.triangles[i]][1] * .9 + verts[del.triangles[i + 1]][1] * 1.1 + verts[del.triangles[i + 2]][1]) / 3
        intersections = 0
        for (let edge of bins[Math.floor(center_y)] ?? []) {
            let a = verts[edge[0]]
            let b = verts[edge[1]]
            let v2dotv3 = b[1] - a[1]
            let t1 = ((b[0] - a[0]) * (center_y - a[1]) - (b[1] - a[1]) * (center_x - a[0])) / v2dotv3
            let t2 = (center_y - a[1]) / v2dotv3
            if (t1 > 0 && t2 > 0 && t2 <= 1)
                intersections++
        }


        if (intersections % 2 == 0) {
            continue
        }

        triangles_ids.push(del.triangles[i], del.triangles[i + 2], del.triangles[i + 1])
    }

    let verts_3d = verts.map(v => {
        return [(v[0] - .5) * parameters.scale, (v[1] - .5) * parameters.scale, parameters.vscale * (layer.height + 1) / parameters.layer_count]
    }).flat()
    triangles_ids = triangles_ids.concat(triangles_ids.map(i => i + verts_3d.length / 3).reverse())
    verts_3d = verts_3d.concat(verts.map(v => {
        return [(v[0] - .5) * parameters.scale, (v[1] - .5) * parameters.scale, parameters.vscale * layer.height / parameters.layer_count]
    }).flat())

    triangles_ids = triangles_ids.concat(seam_tris.map(i => i + verts_3d.length / 3))
    verts_3d = verts_3d.concat(seam_verts.flat())

    postMessage({
        type: "make_mesh",
        triangles_ids: triangles_ids,
        verts_3d: verts_3d,
        color: layer.color
    })

    // this.create_mesh(triangles_ids, verts_3d, layer.color)
}

function process_loop(loop): Vertex3[] {
    loop = loop.map(v => unhash(v))
    return loop.map((v, i) => {
        let vl = loop[(i + loop.length - 1) % loop.length]
        let vr = loop[(i + loop.length + 1) % loop.length]
        return [
            (2 * v[0] + vl[0] + vr[0]) / 4,
            (2 * v[1] + vl[1] + vr[1]) / 4
        ]
    })
}

function makeNoise(baseNoise: Function, scale: number, octaves: number): Function {
    const persistence = .8
    const frequency = 1
    const amplitude = 1
    return (x, y) => {
        let value = 0.0
        for (let octave = 0; octave < octaves; octave++) {
            const freq = frequency * Math.pow(2, octave)
            value += baseNoise(x / scale * freq, y / scale * freq) *
                (amplitude * Math.pow(persistence, octave))
        }
        return value / (2 - 1 / Math.pow(2, octaves - 1))
    }
}

const SQUARES: Map<number, Vertex2[][]> = new Map([
    [0, []],
    [1, [[[.5, 0], [0, .5]]]],
    [2, [[[.5, 0], [1, .5]]]],
    [3, [[[0, .5], [1, .5]]]],
    [4, [[[.5, 1], [1, .5]]]],
    [5, [[[.5, 0], [1, .5]], [[0, .5], [.5, 1]]]],
    [6, [[[.5, 0], [.5, 1]]]],
    [7, [[[0, .5], [.5, 1]]]],
    [8, [[[0, .5], [.5, 1]]]],
    [9, [[[.5, 0], [.5, 1]]]],
    [10, [[[.5, 0], [0, .5]], [[1, .5], [.5, 1]]]],
    [11, [[[1, .5], [.5, 1]]]],
    [12, [[[0, .5], [1, .5]]]],
    [13, [[[.5, 0], [1, .5]]]],
    [14, [[[.5, 0], [0, .5]]]],
    [15, []]
])

function hash(v: number[]): string {
    return Math.floor(v[0] * 1000) + " " + Math.floor(v[1] * 1000)
}

function unhash(v: string): number[] {
    let strs = v.split(' ')
    return [parseInt(strs[0]) / 1000, parseInt(strs[1]) / 1000]
}

function add_edges(layer: Layer, cornervals: Corners, x: number, y: number, parameters: Parameters) {
    let index = 0
    for (let i = 0; i < 4; i++) {
        index += cornervals[i] >= layer.height / parameters.layer_count ? 1 << i : 0
    }

    let new_edges = SQUARES.get(index)
    for (let edge of new_edges) {
        let v1 = hash(interpolate(edge[0], cornervals, x, y, layer, parameters))
        let v2 = hash(interpolate(edge[1], cornervals, x, y, layer, parameters))

        layer.verts.add(v1)
        layer.verts.add(v2)

        let v1edges = layer.edges.get(v1) ?? []
        v1edges.push(v2)
        if (v1edges.length > 2)
            console.log("More than two edges at a point on layer: " + layer.height, v1, v2)
        layer.edges.set(v1, v1edges)

        let v2edges = layer.edges.get(v2) ?? []
        v2edges.push(v1)
        if (v2edges.length > 2)
            console.log("More than two edges at a point on layer: " + layer.height, v1, v2)
        layer.edges.set(v2, v2edges)
    }
}

function colorgradient(val, colors: ImageData): Uint8ClampedArray {
    return colors.data.slice(4 * Math.floor(val * colors.width), 4 * Math.floor(val * colors.width) + 3)
}

function randn_bm() {
    let u = 0, v = 0
    while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
}