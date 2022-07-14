/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/worker.ts":
/*!***********************!*\
  !*** ./src/worker.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var seedrandom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! seedrandom */ \"./node_modules/seedrandom/index.js\");\n/* harmony import */ var seedrandom__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(seedrandom__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var delaunator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! delaunator */ \"./node_modules/delaunator/index.js\");\n/* harmony import */ var _kninnug_constrainautor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @kninnug/constrainautor */ \"./node_modules/@kninnug/constrainautor/lib/Constrainautor.mjs\");\n/* harmony import */ var open_simplex_noise__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! open-simplex-noise */ \"./node_modules/open-simplex-noise/lib/mod.js\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\n\r\n\r\n\r\n\r\naddEventListener('message', (evt) => __awaiter(void 0, void 0, void 0, function* () {\r\n    const data = evt.data;\r\n    const parameters = data.parameters;\r\n    seedrandom__WEBPACK_IMPORTED_MODULE_0___default()(data.seed, { global: true });\r\n    const noisex = makeNoise((0,open_simplex_noise__WEBPACK_IMPORTED_MODULE_2__.makeNoise2D)(Math.random() * 100000), parameters.angle.scale, parameters.angle.octaves);\r\n    const noisey = makeNoise((0,open_simplex_noise__WEBPACK_IMPORTED_MODULE_2__.makeNoise2D)(Math.random() * 100000), parameters.angle.scale, parameters.angle.octaves);\r\n    const noiseheight = makeNoise((0,open_simplex_noise__WEBPACK_IMPORTED_MODULE_2__.makeNoise2D)(Math.random() * 100000), parameters.roughness.scale, parameters.roughness.octaves);\r\n    const noise = makeNoise((0,open_simplex_noise__WEBPACK_IMPORTED_MODULE_2__.makeNoise2D)(Math.random() * 100000), parameters.base.scale, parameters.base.octaves);\r\n    function atan2(y, x) {\r\n        // See https://github.com/mrdoob/three.js/issues/10766\r\n        var sign = 1.0 - (+(y < 0.0) << 1);\r\n        var absYandR = y * sign + 2.220446049250313e-16;\r\n        var partSignX = (+(x < 0.0) << 1); // [0.0/2.0]\r\n        var signX = 1.0 - partSignX; // [1.0/-1.0]\r\n        absYandR = (x - signX * absYandR) / (signX * x + absYandR);\r\n        return ((partSignX + 1.0) * 0.7853981634 + (0.1821 * absYandR * absYandR - 0.9675) * absYandR) * sign;\r\n    }\r\n    function val(x, y) {\r\n        if (x < 0 || y < 0 || x >= parameters.size || y >= parameters.size)\r\n            return 0;\r\n        let pixel_height = noiseheight(x, y) / 2 + .5;\r\n        let pixel_base = noise(x, y) / 2 + .5;\r\n        let angle = atan2(noisey(x, y), noisex(x, y));\r\n        if (angle < -.4)\r\n            angle += Math.PI * 2;\r\n        if (angle < 0)\r\n            angle = angle * (Math.PI * 2 / -.4);\r\n        let r = Math.sqrt(Math.pow(x - parameters.size / 2, 2) + Math.pow(y - parameters.size / 2, 2)) / (parameters.size / 2);\r\n        // pixel_base /= 1 + Math.pow(r * 3, 8)\r\n        // pixelh /= 1 + Math.pow(r * 2, 8)\r\n        let pixel = (angle / (Math.PI * 2)) * pixel_height + pixel_base * (1 - pixel_height);\r\n        pixel /= 1 + Math.pow(r * 1.5, 8);\r\n        return pixel;\r\n    }\r\n    // Pre-generate values\r\n    let vals = new Map();\r\n    let w = parameters.size + 2;\r\n    for (let x = -1; x < parameters.size + 1; x++)\r\n        for (let y = -1; y < parameters.size + 1; y++)\r\n            vals.set(x + y * w, val(x, y));\r\n    // Create empty layers\r\n    let layers = [];\r\n    for (let height = 0; height < parameters.layer_count; height++) {\r\n        layers.push({\r\n            height: height,\r\n            color: colorgradient(height / parameters.layer_count, data.colors),\r\n            verts: new Set(),\r\n            edges: new Map()\r\n        });\r\n    }\r\n    let pixels = [];\r\n    // Add edges to layers (and send pixels to main thread)\r\n    for (let x = 0; x < parameters.size + 1; x++) {\r\n        for (let y = 0; y < parameters.size + 1; y++) {\r\n            let cornervals = [vals.get((x - 1) + (y - 1) * w), vals.get(x + (y - 1) * w), vals.get(x + y * w), vals.get((x - 1) + y * w)];\r\n            for (let layer of layers) {\r\n                add_edges(layer, cornervals, x, y, parameters);\r\n            }\r\n            if (evt.data.generate_image) {\r\n                let color = colorgradient(cornervals[0], data.colors);\r\n                pixels.push({\r\n                    color: \"rgb(\" + color[0] + \",\" + color[1] + \",\" + color[2] + \")\",\r\n                    raw: cornervals[0] * 255,\r\n                    x: parameters.size + 1 - x,\r\n                    y: y - 2\r\n                });\r\n                if (pixels.length == parameters.size + 1) {\r\n                    postMessage({\r\n                        type: \"fill_pixels\",\r\n                        pixels: pixels\r\n                    });\r\n                    pixels = [];\r\n                }\r\n            }\r\n        }\r\n    }\r\n    for (let layer of layers)\r\n        display(layer, parameters);\r\n    let water_level = (randn_bm() * .3 + .1) * parameters.vscale;\r\n    water_level -= water_level % (parameters.vscale / parameters.layer_count);\r\n    water_level -= (parameters.vscale / parameters.layer_count) / 2;\r\n    postMessage({\r\n        type: \"add_water\",\r\n        water_level: water_level\r\n    });\r\n}));\r\nfunction interpolate(centered_vert, cornervals, x, y, layer, parameters) {\r\n    let vert = [centered_vert[0] + x, centered_vert[1] + y];\r\n    let v0 = cornervals[0];\r\n    let v1 = cornervals[1];\r\n    let v2 = cornervals[2];\r\n    let v3 = cornervals[3];\r\n    if (vert[0] == x && Math.abs(v0 - v3) == 0)\r\n        console.log(\"0 diff 1\");\r\n    if (vert[0] == x + 1 && Math.abs(v1 - v2) == 0)\r\n        console.log(\"0 diff 2\");\r\n    if (vert[1] == y && Math.abs(v0 - v1) == 0)\r\n        console.log(\"0 diff 3\");\r\n    if (vert[1] == y + 1 && Math.abs(v3 - v2) == 0)\r\n        console.log(\"0 diff 4\");\r\n    function clamp(x) { return Math.max(Math.min(x, .999), .001); }\r\n    if (vert[0] == x && Math.abs(v0 - v3) != 0)\r\n        return [vert[0], (Math.floor(vert[1]) + clamp((v0 - layer.height / parameters.layer_count) / (v0 - v3)))];\r\n    if (vert[0] == x + 1 && Math.abs(v1 - v2) != 0)\r\n        return [vert[0], (Math.floor(vert[1]) + clamp((v1 - layer.height / parameters.layer_count) / (v1 - v2)))];\r\n    if (vert[1] == y && Math.abs(v0 - v1) != 0)\r\n        return [(Math.floor(vert[0]) + clamp((v0 - layer.height / parameters.layer_count) / (v0 - v1))), vert[1]];\r\n    if (vert[1] == y + 1 && Math.abs(v3 - v2) != 0)\r\n        return [(Math.floor(vert[0]) + clamp((v3 - layer.height / parameters.layer_count) / (v3 - v2))), vert[1]];\r\n    console.log(\"interpolation failed: \", vert);\r\n    return vert;\r\n}\r\nfunction display(layer, parameters) {\r\n    function valid_next(key, start) {\r\n        if (layer.edges.has(key))\r\n            for (let i = 0; i < layer.edges.get(key).length; i++) {\r\n                if (layer.edges.get(key)[i] != start && layer.edges.has(layer.edges.get(key)[i]))\r\n                    return layer.edges.get(key)[i];\r\n            }\r\n        return null;\r\n    }\r\n    let loops = [];\r\n    while (layer.edges.size > 0) {\r\n        let loop = [];\r\n        let joint = layer.edges.keys().next().value;\r\n        let start = joint;\r\n        loop.push(start);\r\n        let end = layer.edges.get(start)[0];\r\n        loop.push(end);\r\n        let other_joint = layer.edges.get(start)[1];\r\n        layer.edges.delete(start);\r\n        while (end != joint) {\r\n            if (!layer.edges.has(end))\r\n                break;\r\n            let destination = valid_next(end, start);\r\n            if (destination) {\r\n                start = end;\r\n                end = destination;\r\n                loop.push(end);\r\n                layer.edges.delete(start);\r\n            }\r\n            else\r\n                layer.edges.delete(end);\r\n        }\r\n        if (loop[loop.length - 1] != other_joint)\r\n            console.log(\"loop failed\", loop[loop.length - 1], other_joint);\r\n        if (loop.length > 9) {\r\n            let adjusted_loop = process_loop(loop);\r\n            loops.push(adjusted_loop);\r\n            // Debug lines\r\n            // if (loop[loop.length - 1] != other_joint) {\r\n            //     const points = []\r\n            //     points.push(new Vector3(unhash(loop[loop.length - 1])[0] - .5 * parameters.scale, (unhash(loop[loop.length - 1])[1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))\r\n            //     points.push(new Vector3(unhash(other_joint)[0] - .5 * this.parameters.scale, (unhash(other_joint)[1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))\r\n            //     this.debug_line(points, 0xff00ff)\r\n            // }\r\n            // const points = []\r\n            // for (let i = 0; i < adjusted_loop.length; i++) {\r\n            //     points.push(new Vector3(adjusted_loop[i][0] - .5 * this.parameters.scale, (adjusted_loop[i][1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))\r\n            //     points.push(new Vector3(adjusted_loop[(i + 1) % adjusted_loop.length][0] - .5 * this.parameters.scale, (adjusted_loop[(i + 1) % adjusted_loop.length][1] - .5) * this.parameters.scale, this.parameters.vscale * (layer.height + 1) / this.parameters.layer_count))\r\n            // }\r\n            // this.debug_line(points, 0x0033ff)\r\n        }\r\n    }\r\n    render_layer_mesh(loops, layer, parameters);\r\n}\r\nfunction render_layer_mesh(loops, layer, parameters) {\r\n    var _a, _b;\r\n    if (loops.length == 0)\r\n        return;\r\n    let verts = [];\r\n    let edges = [];\r\n    let seam_verts = [];\r\n    let seam_tris = [];\r\n    let base_index = 0;\r\n    for (let loop of loops) {\r\n        for (let i = 0; i < loop.length; i++) {\r\n            edges.push([i + base_index, (i + 1) % loop.length + base_index]);\r\n            seam_verts.push([(loop[i][0] - .5) * parameters.scale, (loop[i][1] - .5) * parameters.scale, parameters.vscale * layer.height / parameters.layer_count]);\r\n            seam_verts.push([(loop[i][0] - .5) * parameters.scale, (loop[i][1] - .5) * parameters.scale, parameters.vscale * (layer.height + 1) / parameters.layer_count]);\r\n            let seam_base = base_index * 2;\r\n            let next_base_index = (i * 2 + 2) % (2 * loop.length) + seam_base;\r\n            let next_top_index = (i * 2 + 3) % (2 * loop.length) + seam_base;\r\n            seam_tris.push(i * 2 + seam_base, next_base_index, i * 2 + 1 + seam_base);\r\n            seam_tris.push(i * 2 + 1 + seam_base, next_base_index, next_top_index);\r\n        }\r\n        verts = verts.concat(loop);\r\n        base_index += loop.length;\r\n    }\r\n    // let triangles_ids: number[] = cdt2d(verts, edges, { exterior: false }).flat()\r\n    let del = delaunator__WEBPACK_IMPORTED_MODULE_3__[\"default\"].from(verts);\r\n    try {\r\n        new _kninnug_constrainautor__WEBPACK_IMPORTED_MODULE_1__[\"default\"](del, edges);\r\n    }\r\n    catch (_c) { }\r\n    let triangles_ids = [];\r\n    // Filter for valid triangles\r\n    // Place edges into bins based on their y value:\r\n    let bins = [];\r\n    for (let edge of edges) {\r\n        let y_max = Math.max(verts[edge[0]][1], verts[edge[1]][1]) + .001;\r\n        let y_min = Math.min(verts[edge[0]][1], verts[edge[1]][1]) - .001;\r\n        for (let y = Math.floor(y_min); y <= y_max; y++) {\r\n            if (bins[y] == undefined)\r\n                bins[y] = [];\r\n            bins[y].push(edge);\r\n        }\r\n    }\r\n    // Remove all triangles that cross an even number of edges exiting the polygon\r\n    for (let i = 0; i < del.triangles.length; i += 3) {\r\n        let center_x = (verts[del.triangles[i]][0] + verts[del.triangles[i + 1]][0] + verts[del.triangles[i + 2]][0]) / 3;\r\n        let center_y = (verts[del.triangles[i]][1] + verts[del.triangles[i + 1]][1] + verts[del.triangles[i + 2]][1]) / 3;\r\n        // Count number of intersections with a line going right to infinity\r\n        let intersections = 0;\r\n        for (let edge of (_a = bins[Math.floor(center_y)]) !== null && _a !== void 0 ? _a : []) {\r\n            // https://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/\r\n            let a = verts[edge[0]];\r\n            let b = verts[edge[1]];\r\n            // Edge cases probably dont help with bins method\r\n            // if ((a[0] < center_x && b[0] < center_x) || (a[1] < center_y && b[1] < center_y) || (a[1] < center_y && b[1] < center_y))\r\n            //     continue\r\n            // let v1 = [center_x - a[0], center_y - a[1]]\r\n            // let v2 = [b[0]- a[0], b[1] - a[1]]\r\n            // let v3 = [0, 1]\r\n            let v2dotv3 = b[1] - a[1];\r\n            let t1 = ((b[0] - a[0]) * (center_y - a[1]) - (b[1] - a[1]) * (center_x - a[0])) / v2dotv3;\r\n            let t2 = (center_y - a[1]) / v2dotv3;\r\n            if (t1 > 0 && t2 > 0 && t2 <= 1)\r\n                intersections++;\r\n        }\r\n        if (intersections % 2 == 0) {\r\n            continue;\r\n        }\r\n        center_x = (verts[del.triangles[i]][0] * .9 + verts[del.triangles[i + 1]][0] * 1.1 + verts[del.triangles[i + 2]][0]) / 3;\r\n        center_y = (verts[del.triangles[i]][1] * .9 + verts[del.triangles[i + 1]][1] * 1.1 + verts[del.triangles[i + 2]][1]) / 3;\r\n        intersections = 0;\r\n        for (let edge of (_b = bins[Math.floor(center_y)]) !== null && _b !== void 0 ? _b : []) {\r\n            let a = verts[edge[0]];\r\n            let b = verts[edge[1]];\r\n            let v2dotv3 = b[1] - a[1];\r\n            let t1 = ((b[0] - a[0]) * (center_y - a[1]) - (b[1] - a[1]) * (center_x - a[0])) / v2dotv3;\r\n            let t2 = (center_y - a[1]) / v2dotv3;\r\n            if (t1 > 0 && t2 > 0 && t2 <= 1)\r\n                intersections++;\r\n        }\r\n        if (intersections % 2 == 0) {\r\n            continue;\r\n        }\r\n        triangles_ids.push(del.triangles[i], del.triangles[i + 2], del.triangles[i + 1]);\r\n    }\r\n    let verts_3d = verts.map(v => {\r\n        return [(v[0] - .5) * parameters.scale, (v[1] - .5) * parameters.scale, parameters.vscale * (layer.height + 1) / parameters.layer_count];\r\n    }).flat();\r\n    triangles_ids = triangles_ids.concat(triangles_ids.map(i => i + verts_3d.length / 3).reverse());\r\n    verts_3d = verts_3d.concat(verts.map(v => {\r\n        return [(v[0] - .5) * parameters.scale, (v[1] - .5) * parameters.scale, parameters.vscale * layer.height / parameters.layer_count];\r\n    }).flat());\r\n    triangles_ids = triangles_ids.concat(seam_tris.map(i => i + verts_3d.length / 3));\r\n    verts_3d = verts_3d.concat(seam_verts.flat());\r\n    postMessage({\r\n        type: \"make_mesh\",\r\n        triangles_ids: triangles_ids,\r\n        verts_3d: verts_3d,\r\n        color: layer.color\r\n    });\r\n    // this.create_mesh(triangles_ids, verts_3d, layer.color)\r\n}\r\nfunction process_loop(loop) {\r\n    loop = loop.map(v => unhash(v));\r\n    return loop.map((v, i) => {\r\n        let vl = loop[(i + loop.length - 1) % loop.length];\r\n        let vr = loop[(i + loop.length + 1) % loop.length];\r\n        return [\r\n            (2 * v[0] + vl[0] + vr[0]) / 4,\r\n            (2 * v[1] + vl[1] + vr[1]) / 4\r\n        ];\r\n    });\r\n}\r\nfunction makeNoise(baseNoise, scale, octaves) {\r\n    const persistence = .8;\r\n    const frequency = 1;\r\n    const amplitude = 1;\r\n    return (x, y) => {\r\n        let value = 0.0;\r\n        for (let octave = 0; octave < octaves; octave++) {\r\n            const freq = frequency * Math.pow(2, octave);\r\n            value += baseNoise(x / scale * freq, y / scale * freq) *\r\n                (amplitude * Math.pow(persistence, octave));\r\n        }\r\n        return value / (2 - 1 / Math.pow(2, octaves - 1));\r\n    };\r\n}\r\nconst SQUARES = new Map([\r\n    [0, []],\r\n    [1, [[[.5, 0], [0, .5]]]],\r\n    [2, [[[.5, 0], [1, .5]]]],\r\n    [3, [[[0, .5], [1, .5]]]],\r\n    [4, [[[.5, 1], [1, .5]]]],\r\n    [5, [[[.5, 0], [1, .5]], [[0, .5], [.5, 1]]]],\r\n    [6, [[[.5, 0], [.5, 1]]]],\r\n    [7, [[[0, .5], [.5, 1]]]],\r\n    [8, [[[0, .5], [.5, 1]]]],\r\n    [9, [[[.5, 0], [.5, 1]]]],\r\n    [10, [[[.5, 0], [0, .5]], [[1, .5], [.5, 1]]]],\r\n    [11, [[[1, .5], [.5, 1]]]],\r\n    [12, [[[0, .5], [1, .5]]]],\r\n    [13, [[[.5, 0], [1, .5]]]],\r\n    [14, [[[.5, 0], [0, .5]]]],\r\n    [15, []]\r\n]);\r\nfunction hash(v) {\r\n    return Math.floor(v[0] * 1000) + \" \" + Math.floor(v[1] * 1000);\r\n}\r\nfunction unhash(v) {\r\n    let strs = v.split(' ');\r\n    return [parseInt(strs[0]) / 1000, parseInt(strs[1]) / 1000];\r\n}\r\nfunction add_edges(layer, cornervals, x, y, parameters) {\r\n    var _a, _b;\r\n    let index = 0;\r\n    for (let i = 0; i < 4; i++) {\r\n        index += cornervals[i] >= layer.height / parameters.layer_count ? 1 << i : 0;\r\n    }\r\n    let new_edges = SQUARES.get(index);\r\n    for (let edge of new_edges) {\r\n        let v1 = hash(interpolate(edge[0], cornervals, x, y, layer, parameters));\r\n        let v2 = hash(interpolate(edge[1], cornervals, x, y, layer, parameters));\r\n        layer.verts.add(v1);\r\n        layer.verts.add(v2);\r\n        let v1edges = (_a = layer.edges.get(v1)) !== null && _a !== void 0 ? _a : [];\r\n        v1edges.push(v2);\r\n        if (v1edges.length > 2)\r\n            console.log(\"More than two edges at a point on layer: \" + layer.height, v1, v2);\r\n        layer.edges.set(v1, v1edges);\r\n        let v2edges = (_b = layer.edges.get(v2)) !== null && _b !== void 0 ? _b : [];\r\n        v2edges.push(v1);\r\n        if (v2edges.length > 2)\r\n            console.log(\"More than two edges at a point on layer: \" + layer.height, v1, v2);\r\n        layer.edges.set(v2, v2edges);\r\n    }\r\n}\r\nfunction colorgradient(val, colors) {\r\n    return colors.data.slice(4 * Math.floor(val * colors.width), 4 * Math.floor(val * colors.width) + 3);\r\n}\r\nfunction randn_bm() {\r\n    let u = 0, v = 0;\r\n    while (u === 0)\r\n        u = Math.random(); //Converting [0,1) to (0,1)\r\n    while (v === 0)\r\n        v = Math.random();\r\n    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);\r\n    num = num / 10.0 + 0.5; // Translate to 0 -> 1\r\n    if (num > 1 || num < 0)\r\n        return randn_bm(); // resample between 0 and 1\r\n    return num;\r\n}\r\n\n\n//# sourceURL=webpack://islands/./src/worker.ts?");

/***/ }),

/***/ "?d4c0":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://islands/crypto_(ignored)?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_open-simplex-noise_lib_mod_js-node_modules_seedrandom_index_js-node_modu-8a0567"], () => (__webpack_require__("./src/worker.ts")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd define */
/******/ 	(() => {
/******/ 		__webpack_require__.amdD = function () {
/******/ 			throw new Error('define cannot be used indirect');
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".pack.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_worker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkislands"] = self["webpackChunkislands"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_open-simplex-noise_lib_mod_js-node_modules_seedrandom_index_js-node_modu-8a0567").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;