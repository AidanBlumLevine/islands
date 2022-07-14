export type Layer = { height: number, color: Uint8ClampedArray, verts: Set<string>, edges: Map<string, string[]> }
export type Vertex2 = [number, number]
export type Vertex3 = [number, number, number]
export type Corners = [number, number, number, number]

export type Parameters = {
    size: number,
    layer_count: number,
    scale: number,
    vscale: number,
    generate_image: boolean,
    angle: {
        scale: number,
        octaves: number
    },
    roughness: {
        scale: number,
        octaves: number
    },
    base: {
        scale: number,
        octaves: number
    }
}

export type OutPacket = {
    seed: string,
    parameters: Parameters,
    colors: ImageData
    generate_image: boolean
}