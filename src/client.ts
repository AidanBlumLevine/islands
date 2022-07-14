import seedrandom from 'seedrandom'
import { ShaderMaterial, CameraHelper, sRGBEncoding, Color, BufferGeometry, Float32BufferAttribute, MeshStandardMaterial, Mesh, PerspectiveCamera, Scene, DirectionalLight, WebGLRenderer, MeshNormalMaterial, AmbientLight, PCFSoftShadowMap, Vector3, DoubleSide, Line, LineBasicMaterial, Quaternion, Box3, BoxHelper, Box3Helper, Points, PointsMaterial, PlaneGeometry, MeshBasicMaterial, CircleGeometry, DepthTexture, NearestFilter, WebGLRenderTarget, MeshDepthMaterial, NoBlending, RGBADepthPacking, UnsignedShortType, WebGLCubeRenderTarget, Material as Mat, CircleBufferGeometry, DepthFormat, Vector2, ShaderLib, UniformsUtils, CanvasTexture, Texture, Wrapping } from 'three'
import { OutPacket, Parameters, Vertex2, Vertex3, Layer, Corners } from './interfaces'

class Client {
    layers: Layer[] = []
    camera: PerspectiveCamera
    scene: Scene
    renderer: WebGLRenderer
    renderTarget: WebGLRenderTarget
    depthMaterial: MeshDepthMaterial
    waterMaterial: ShaderMaterial
    water: Mesh
    meshes: Mesh[] = []
    light: DirectionalLight
    parameters: Parameters = {
        size: 32,
        layer_count: 30,
        scale: 1,
        vscale: 10,
        generate_image: true,
        angle: {
            scale: 32,
            octaves: 3
        },
        roughness: {
            scale: 32,
            octaves: 3
        },
        base: {
            scale: 32,
            octaves: 3
        }
    }
    color_gradient: ImageData
    supportsDepthTextureExtension: boolean
    pixelRatio: number
    height_tex: Texture

    constructor() {
        let inst = this
        let image = document.createElement("img")
        image.src = "gradient_longer.png"
        image.onload = (e) => {
            let canvas = document.createElement('canvas')
            canvas.width = image.naturalWidth
            let context = canvas.getContext('2d')
            context.drawImage(image, 0, 0)
            this.color_gradient = context.getImageData(0, 1, image.naturalWidth, 1)
            this.loaded()
        }

        this.scene = new Scene()
        this.scene.background = new Color(0xF8F5EC)

        this.renderer = new WebGLRenderer({ antialias: true })
        this.renderer.outputEncoding = sRGBEncoding
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.autoUpdate = false
        this.renderer.shadowMap.type = PCFSoftShadowMap
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.getElementById("renderer-target").appendChild(this.renderer.domElement)

        if (this.renderer.capabilities.isWebGL2 === false && this.renderer.extensions.has('WEBGL_depth_texture') === false)
            alert("missing depth extension")

        this.pixelRatio = this.renderer.getPixelRatio()
        this.renderTarget = new WebGLRenderTarget(
            window.innerWidth * this.pixelRatio,
            window.innerHeight * this.pixelRatio,
        )

        this.renderTarget.texture.minFilter = NearestFilter
        this.renderTarget.texture.magFilter = NearestFilter
        this.renderTarget.texture.generateMipmaps = false
        this.renderTarget.stencilBuffer = false

        if (this.supportsDepthTextureExtension === true) {
            this.renderTarget.depthTexture = new DepthTexture(2048, 2048, UnsignedShortType)
            this.renderTarget.depthTexture.type = UnsignedShortType
            this.renderTarget.depthTexture.minFilter = NearestFilter
            this.renderTarget.depthTexture.magFilter = NearestFilter
        }

        this.depthMaterial = new MeshDepthMaterial()
        this.depthMaterial.depthPacking = RGBADepthPacking
        this.depthMaterial.blending = NoBlending

        window.addEventListener('resize', onWindowResize)

        this.camera = new PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 3500)
        this.setup_camera()

        // ====================================================================

        this.light = new DirectionalLight(0xf4f1d5, 1.5)
        this.light.position.set(50, 50, 50)
        this.light.castShadow = true
        this.light.shadow.mapSize.width = Math.min(2 ** 12, this.renderer.capabilities.maxTextureSize)
        this.light.shadow.mapSize.height = Math.min(2 ** 12, this.renderer.capabilities.maxTextureSize)
        this.light.shadow.radius = 2
        this.light.rotateOnAxis(new Vector3(-1, -1, -1), .25)

        this.scene.add(this.light)
        let ambient = new AmbientLight(0x97afe7, 1)
        this.scene.add(ambient)
    }

    loaded() {
        var inst = this
        document.getElementById('generate').addEventListener('click', () => { inst.generate() })
        for (let element of document.getElementsByClassName('parameter-control'))
            element.addEventListener('input', function (e) {
                let keys = element.getAttribute('key').split('.')
                let target_var = inst.parameters
                for (let i = 0; i < keys.length - 1; i++)
                    target_var = target_var[keys[i]]
                target_var[keys[keys.length - 1]] = parseFloat((<HTMLInputElement>e.target).value)
            })
        this.generate()
    }

    generate(set_seed = undefined) {
        let inst = this
        let seed_element = document.getElementById('seed') as HTMLInputElement

        let seed: string
        if (set_seed) {
            seed = set_seed
            seed_element.placeholder = set_seed
        } else {
            seed = seed_element.value.toString()
            if (seed_element.value.toString().length == 0) {
                let tempseed = "" + Date.now()
                let rng = seedrandom(tempseed)
                seed = Math.abs(rng.int32()).toString()
                seed_element.placeholder = seed
            }
        }

        for (let m of this.meshes) {
            this.scene.remove(m)
        }
        this.meshes = []
        this.scene.remove(this.water)

        let ctx: CanvasRenderingContext2D
        let bwctx: CanvasRenderingContext2D
        if (this.parameters.generate_image && !set_seed) {
            let canvas = document.createElement('canvas')
            let bwcanvas = document.createElement('canvas')
            canvas.width = this.parameters.size
            canvas.height = this.parameters.size
            bwcanvas.width = this.parameters.size
            bwcanvas.height = this.parameters.size
            canvas.style.height = "100px"
            canvas.style.width = "100px"
            canvas.setAttribute('seed', seed.toString())
            canvas.onclick = function () {
                inst.generate(canvas.getAttribute('seed'))
            }
            document.getElementById('images').prepend(canvas)
            ctx = canvas.getContext('2d')
            bwctx = bwcanvas.getContext('2d')
            ctx.imageSmoothingEnabled = false
            this.height_tex = new Texture(bwcanvas)
        }

        let worker = new Worker(new URL('./worker', import.meta.url))
        let op: OutPacket = {
            seed: seed,
            parameters: this.parameters,
            generate_image: this.parameters.generate_image && !set_seed,
            colors: this.color_gradient
        }

        worker.postMessage(op)
        worker.onmessage = (evt) => {
            let type = evt.data.type
            if (type == "fill_pixels") {
                for (let p of evt.data.pixels) {
                    ctx.fillStyle = p.color
                    ctx.fillRect(p.x, p.y, 1, 1)
                    bwctx.fillStyle = 'rgb('+p.raw+','+p.raw+','+p.raw+')'
                    bwctx.fillRect(p.x, p.y, 1, 1)
                }
                this.height_tex.needsUpdate = true
            }
            if (type == "make_mesh") {
                this.create_mesh(evt.data.triangles_ids, evt.data.verts_3d, evt.data.color)
            }
            if (type == "add_water") {
                this.make_water(evt.data.water_level)
            }
        }

        this.light.shadow.camera.left = 0
        this.light.shadow.camera.right = 0
        this.light.shadow.camera.bottom = 0
        this.light.shadow.camera.top = 0

        // setTimeout(() => {
        //     const cameraHelper = new CameraHelper(inst.light.shadow.camera)
        //     inst.scene.add(cameraHelper)
        // }, 100)
    }

    debug_line(points, color) {
        const material = new LineBasicMaterial({ color: color })
        const geometry = new BufferGeometry().setFromPoints(points)
        const line = new Line(geometry, material)
        let scale_v = 200 / Math.SQRT2 / this.parameters.size
        line.scale.set(scale_v / 2, scale_v, scale_v)
        line.translateX(-this.parameters.size / 2 * this.parameters.scale * scale_v - .35)
        line.translateY(-this.parameters.size / 2 * this.parameters.scale * scale_v)
        this.scene.add(line)
    }

    create_mesh(triangle_indicies: number[], vertex_positions: number[], color) {
        const geometry = new BufferGeometry()

        geometry.setIndex(triangle_indicies)
        geometry.setAttribute('position', new Float32BufferAttribute(vertex_positions, 3))
        // geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))

        geometry.computeVertexNormals()

        const material = new MeshStandardMaterial({
            color: new Color("rgb(" + color[0] + "," + color[1] + "," + color[2] + ")").convertSRGBToLinear(),
            roughness: .9,
            metalness: .4,
            // side: DoubleSide
            // wireframe :true
        })

        let mesh = new Mesh(geometry, material)
        mesh.receiveShadow = true
        mesh.castShadow = true
        mesh.scale.set(0, 0, 0)
        this.meshes.push(mesh)
        this.scene.add(mesh)

        for (let t = 0; t < 500; t += 10) {
            setTimeout(() => {
                let x = t / 500
                let a = 1.8
                let curve_v = 1 / (1 + (a * x - a / 2) ** 2) + x - 1 / (1 + (a / 2) ** 2)
                let scale_v = 1
                mesh.scale.set(scale_v, scale_v, scale_v * curve_v)
            }, t)
        }
        let scale_v = 1
        mesh.scale.set(scale_v, scale_v, scale_v)
        mesh.position.set(0, 0, 0)
        mesh.translateX((-this.parameters.size - 2) / 2 * this.parameters.scale * scale_v)
        mesh.translateY((-this.parameters.size - 2) / 2 * this.parameters.scale * scale_v)
        this.set_camera(mesh)
        mesh.scale.set(scale_v, scale_v, 0.01)

    }

    setup_camera() {
        let inst = this
        // Camera controls ===================================================
        let camera_distance = 164, camera_x_rot = Math.PI / 4, camera_y_rot = Math.PI / 4, camera_center = new Vector3(0, 0, 0), last_release_right = 0
        function update_camera_pos() {
            camera_y_rot = Math.max(.0001, Math.min(Math.PI / 2 - .0001, camera_y_rot))
            camera_distance = Math.max(10, camera_distance)
            inst.camera.position.copy(camera_center)
            inst.camera.position.add(new Vector3(0, 0, camera_distance).applyAxisAngle(new Vector3(1, 0, 0), camera_y_rot).applyAxisAngle(new Vector3(0, 0, 1), camera_x_rot))
            inst.camera.rotation.set(camera_y_rot, 0, 0)
            inst.camera.rotateOnWorldAxis(new Vector3(0, 0, 1), camera_x_rot)
        }
        update_camera_pos()

        let mouse_left_down = false, mouse_right_down = false, mouse_x = 0, mouse_y = 0
        this.renderer.domElement.addEventListener('mousedown', function (evt) {
            evt.preventDefault()
            if (evt.button == 0) {
                mouse_left_down = true
            }
            if (evt.button == 2) {
                mouse_right_down = true
            }
            mouse_x = evt.clientX
            mouse_y = evt.clientY
        }, false)
        this.renderer.domElement.addEventListener('mousemove', function (evt) {
            if (!mouse_left_down && !mouse_right_down) return
            evt.preventDefault()
            if (mouse_left_down) {
                camera_x_rot -= (evt.clientX - mouse_x) / 100
                camera_y_rot -= (evt.clientY - mouse_y) / 100
            }
            if (mouse_right_down) {
                camera_center.add(new Vector3(0, 1, 0).applyQuaternion(inst.camera.quaternion).multiplyScalar((evt.clientY - mouse_y) / 2))
                camera_center.add(new Vector3(1, 0, 0).applyQuaternion(inst.camera.quaternion).multiplyScalar((evt.clientX - mouse_x) / -2))
                // camera_center.clamp(new Vector3(-500, -500, -10), new Vector3(500, 500, 500))
            }
            update_camera_pos()
            mouse_x = evt.clientX
            mouse_y = evt.clientY
        }, false)
        this.renderer.domElement.addEventListener('mouseup', function (evt) {
            evt.preventDefault()
            if (evt.button == 0) {
                mouse_left_down = false
            }
            if (evt.button == 2) {
                mouse_right_down = false
                if (performance.now() - last_release_right < 250) {
                    camera_center.set(0, 0, 0)
                    update_camera_pos()
                }
                last_release_right = performance.now()
            }
        }, false)
        this.renderer.domElement.addEventListener('mousewheel', function (evt: WheelEvent) {
            camera_distance += evt.deltaY / 4
            update_camera_pos()
        })
        this.renderer.domElement.addEventListener('contextmenu', function (evt) {
            evt.preventDefault()
            return false
        }, false)
    }

    set_camera(mesh) {
        // Resize camera
        let box = new Box3().setFromObject(mesh)
        let corners = [
            new Vector3(box.min.x, box.min.y, box.min.z),
            new Vector3(box.max.x, box.min.y, box.min.z),
            new Vector3(box.min.x, box.max.y, box.min.z),
            new Vector3(box.min.x, box.min.y, box.max.z),
            new Vector3(box.max.x, box.max.y, box.min.z),
            new Vector3(box.max.x, box.min.y, box.max.z),
            new Vector3(box.min.x, box.max.y, box.max.z),
            new Vector3(box.max.x, box.max.y, box.max.z)
        ]
        let flat_quat = new Quaternion().setFromUnitVectors(new Vector3().copy(this.light.position).normalize(), new Vector3(0, 0, 1))
        let light_rot = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -.25)
        for (let corner of corners) {
            let flat_corner = corner.applyQuaternion(flat_quat).applyQuaternion(light_rot)
            this.light.shadow.camera.right = Math.max(flat_corner.x + 8, this.light.shadow.camera.right)
            this.light.shadow.camera.top = Math.max(flat_corner.y + 8, this.light.shadow.camera.top)
            this.light.shadow.camera.left = Math.min(flat_corner.x - 8, this.light.shadow.camera.left)
            this.light.shadow.camera.bottom = Math.min(flat_corner.y - 8, this.light.shadow.camera.bottom)
        }


        this.light.shadow.camera.updateProjectionMatrix()
        this.renderer.shadowMap.needsUpdate = true
    }

    make_water(water_level){
        const geometry = new CircleBufferGeometry(500, 32)
        var uniforms = {
            time: {
                value: 0
            },
            threshold: {
                value: 0.1
            },
            tDudv: {
                value: null
            },
            tDepth: {
                value: null
            },
            tHeight: {
                value: null
            },
            size: {
                value: this.parameters.size
            },
            water_height: {
                value: water_level / this.parameters.vscale
            },
            cameraNear: {
                value: 0
            },
            cameraFar: {
                value: 0
            },
            resolution: {
                value: new Vector2()
            },
            foamColor: {
                value: new Color()
            },
            waterColor: {
                value: new Color()
            }
        }
        this.waterMaterial = new ShaderMaterial({
            defines: {
                DEPTH_PACKING: this.supportsDepthTextureExtension === true ? 0 : 1,
                ORTHOGRAPHIC_CAMERA: 0
            },
            uniforms: uniforms,
            vertexShader: document.querySelector('#vertexShader').textContent.trim(),
            fragmentShader: document.querySelector('#fragmentShader').textContent.trim(),
            transparent: true
        })

        this.waterMaterial.uniforms.cameraNear.value = this.camera.near
        this.waterMaterial.uniforms.cameraFar.value = this.camera.far
        this.waterMaterial.uniforms.resolution.value.set(
            window.innerWidth * this.pixelRatio,
            window.innerHeight * this.pixelRatio
        )
        // this.waterMaterial.uniforms.tDudv.value = dudvMap;
        this.waterMaterial.uniforms.tDepth.value =
            this.supportsDepthTextureExtension === true
                ? this.renderTarget.depthTexture
                : this.renderTarget.texture

        this.waterMaterial.uniforms.tHeight.value = this.height_tex

        this.water = new Mesh(geometry, this.waterMaterial)
        this.water.position.set(0, 0, water_level)
        this.scene.add(this.water)
    }

    // lerpRot(inst) {
    //     if (!inst.mouseDown && this.gencount > this.subdivideCount + 1) {
    //         inst.xRot += (Math.PI / 8 - inst.xRot) * 1 / 30
    //         inst.yRot += (Math.PI / 8 - inst.yRot) * 1 / 30
    //         this.Renderer.draw(this.rects, this.xRot, this.yRot, this.parameters)
    //     }
    // }

    // download() {
    //     let canvas = document.createElement('canvas')
    //     canvas.width = this.ctx.canvas.width * 2
    //     canvas.height = this.ctx.canvas.height * 2
    //     let context = canvas.getContext('2d')
    //     context.strokeStyle = "black"
    //     context.fillStyle = "#F8F5EC"
    //     context.fillRect(0, 0, canvas.width, canvas.height)
    //     this.Renderer.draw(this.rects, this.xRot, this.yRot, this.parameters, context)
    //     let dataURL = canvas.toDataURL('image/png')
    //     let link = document.createElement('a')
    //     link.download = "rectangle_" + this.seed
    //     link.href = dataURL
    //     document.body.appendChild(link)
    //     link.click()
    //     document.body.removeChild(link)
    // }
}

let c = new Client()
render()
function render() {
    requestAnimationFrame(render)

    if (c.water) {
        // depth pass

        // c.water.visible = false // we don't want the depth of the water
        // c.scene.overrideMaterial = c.depthMaterial

        // c.renderer.setRenderTarget(c.renderTarget)
        // c.renderer.render(c.scene, c.camera)
        // c.renderer.setRenderTarget(null)

        // c.scene.overrideMaterial = null
        // c.water.visible = true

        // beauty pass

        var time = performance.now()
        c.waterMaterial.uniforms.threshold.value = .4
        c.waterMaterial.uniforms.time.value = time
        c.waterMaterial.uniforms.foamColor.value.set(0xffffff)
        c.waterMaterial.uniforms.waterColor.value.set(0x14c6a5)
    }

    //  render pass
    c.renderer.render(c.scene, c.camera)
}
function onWindowResize() {
    c.camera.aspect = window.innerWidth / window.innerHeight
    c.camera.updateProjectionMatrix()
    c.renderer.setSize(window.innerWidth, window.innerHeight)

    c.pixelRatio = c.renderer.getPixelRatio()
    c.renderTarget.setSize(
        window.innerWidth * c.pixelRatio,
        window.innerHeight * c.pixelRatio
    )
    c.waterMaterial.uniforms.resolution.value.set(
        window.innerWidth * c.pixelRatio,
        window.innerHeight * c.pixelRatio
    )
}
