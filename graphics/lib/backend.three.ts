/**
 * @see index.ts for information on how object transforms are communicated
 */

import {
    DataTexture,
    // GridHelper,
    LinearFilter,
    LinearMipMapLinearFilter,
    MaterialLoader,
    Matrix4,
    Mesh,
    Object3D,
    ObjectLoader,
    OrthographicCamera,
    PCFSoftShadowMap,
    PerspectiveCamera,
    REVISION,
    RGBAFormat,
    RepeatWrapping,
    Scene,
    Sprite,
    WebGLRenderer,
    LinearToneMapping,
    Points,
    BufferGeometry,
    Material,
    Vector3,
    AdditiveBlending,
    ShaderMaterial,
    BufferAttribute,
    GridHelper,
    Camera,
    CameraHelper,
} from 'three';

// import CSM from 'three-csm';

import {
    ChangeCameraCmd,
    GraphicsAddObjectCmd,
    GraphicsCreateParticleSystemCmd,
    GraphicsInitCmd,
    GraphicsRemoveObjectCmd,
    GraphicsResizeCmd,
    GraphicsUpdateMaterialCmd,
    GraphicsUploadTextureCmd,
} from './commands';
import { Particle, ParticleSystem, updateParticleSystem } from './particles';

const postMessage = (type: string) => (message: any) => globalThis.postMessage({ type, message });
const log = postMessage('log');
const report = postMessage('report');

/**
 * Graphics backend designed to be ran on a WebWorker
 */
export default class GraphicsBackend {
    // eslint-disable-next-line no-undef
    [idx: string]: Function;

    /**
     * Main camera used to render the scene
     * @note camera has Id#0
     */
    #camera: Camera = new PerspectiveCamera(60, 1, 0.1, 2000);

    /**
     * Secondary camera used to render the UI
     * @note uicamera has no Id
     */
    #uicamera = new OrthographicCamera(-20, 20, 20, -20, 1, 10);

    /** Main scene graph object which holds all renderable meshes */
    #scene = new Scene();

    /** Secondary scene which holds all UI elements */
    #uiscene = new Scene();

    /** ThreeJS WebGL renderer instance */
    #renderer!: WebGLRenderer;

    /** map of mesh IDs to mesh instances */
    #idToObject = new Map<number, Object3D>();

    /** map of texture identifiers to raw image data */
    #textureCache = new Map<string, DataTexture>();

    #particle_systems = new Set<ParticleSystem>();

    // #cascade = new CSM({
    //     maxFar: this.#camera.far,
    //     cascades: 4,
    //     shadowMapSize: 1024,
    //     lightDirection: new Vector3(1, -1, 1).normalize(),
    //     camera: this.#camera,
    //     parent: this.#scene
    // });

    /** number of elements per each transform matrix in the shared array buffer */
    readonly #elementsPerTransform = 16;

    constructor() {
        log(import.meta.url);
    }

    init({ canvas, buffer }: GraphicsInitCmd) {
        log('Initializing ...');

        const transformArray = new Float32Array(buffer);

        // @ts-ignore - TSC is cranky about newer DOM features
        const context = canvas.getContext('webgl2', { antialias: true })! as WebGLRenderingContext;

        // initialize renderer instance
        this.#renderer = new WebGLRenderer({
            canvas,
            context,
            antialias: true,
        });
        this.#renderer.toneMapping = LinearToneMapping;
        this.#renderer.toneMappingExposure = 1.0;
        this.#renderer.setClearColor(0x000000);
        this.#renderer.autoClear = false;
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = PCFSoftShadowMap;

        // set up cameras
        this.#camera.matrixAutoUpdate = false;
        this.#scene.add(this.#camera);
        this.#idToObject.set(0, this.#camera);

        this.#uicamera.matrixAutoUpdate = false;
        this.#uicamera.position.z = 10;

        // grid
        // const grid = new GridHelper(100, 100);
        // grid.position.y = 1;
        // // grid.rotateX(Math.PI / 2);
        // this.#scene.add(grid);
        // const grid1 = new GridHelper(99, 50, 0xff00ff, 0xff0000);
        // grid1.position.y = 1.1;
        // this.#scene.add(grid1);

        let previous: number = null!;

        // graphics thread render loop
        const render = (timestamp: number) => {
            requestAnimationFrame(render);

            previous ??= timestamp;
            const delta = (timestamp - previous) / 100.0;
            previous = timestamp;

            this.readTransformsFromArray(transformArray);

            for (const sys of this.#particle_systems) {
                const should_remove = updateParticleSystem(sys, this.#camera, delta);
                if (should_remove) {
                    this.#scene.remove(sys.emitter);
                    this.#particle_systems.delete(sys);
                }
            }

            // this.#cascade.update(this.#camera.matrix);
            this.#renderer.clear();
            this.#renderer.render(this.#scene, this.#camera);
            this.#renderer.clearDepth();
            this.#renderer.render(this.#uiscene, this.#uicamera);
        };

        // start rendering
        requestAnimationFrame(render);
        log(`Ready - ThreeJS renderer v.${REVISION}`);
    }

    changeCamera({ camera_id }: ChangeCameraCmd) {
        this.#camera = this.#idToObject.get(camera_id) as Camera;
    }

    createParticleSystem({ emitter_id, texture_id, particle_count }: GraphicsCreateParticleSystemCmd) {
        const geometry = new BufferGeometry();

        function buffer(name: string, element_size: number) {
            const attribute = new BufferAttribute(new Float32Array(particle_count * element_size), element_size);
            attribute.needsUpdate = true;
            geometry.setAttribute(name, attribute);
        }

        buffer('position', 3);
        buffer('size', 1);
        buffer('angle', 1);

        const particles: Particle[] = [];
        for (let i = 0; i < particle_count; i++) {
            const random = () => (Math.random() - 0.5);
            particles.push({
                position: new Vector3(0, 0, 0),
                velocity: new Vector3(random(), random(), random()).normalize().divideScalar(120),
                acceleration: new Vector3(0, 0, 0),
                angle: Math.random() * Math.PI,
                size: Math.random() * 4
            });
        }

        const uniforms = {
            diffuseTexture: { value: this.#textureCache.get(texture_id) },
            pointMultiplier: { value: 1080 / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0)) }
        };

        const vertexShader = `
        attribute float size;
        attribute float angle;
        uniform float pointMultiplier;
        varying vec4 vColour;
        varying vec2 vAngle;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * pointMultiplier / gl_Position.w;
            vAngle = vec2(cos(angle), sin(angle));
            vColour = vec4(1.0, 1.0, 1.0, 1.0);
        }`;

        const fragmentShader = `
        uniform sampler2D diffuseTexture;
        varying vec4 vColour;
        varying vec2 vAngle;
        void main() {
            vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
            gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
        }`;

        const experimaterial = new ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            blending: AdditiveBlending,
            transparent: true,
            depthWrite: false,
            depthTest: true,
        });

        const emitter = new Points(geometry, experimaterial);
        emitter.frustumCulled = false;
        emitter.matrixAutoUpdate = false;

        this.#scene.add(emitter);
        this.#idToObject.set(emitter_id, emitter);

        this.#particle_systems.add({
            emitter,
            geometry,
            particles,
            age: 0,
            max_age: 1000
        });
    }

    /** Copy object transforms into their corresponding ThreeJS renderable */
    private readTransformsFromArray(transformArray: Float32Array) {
        for (const [id, object] of this.#idToObject) {
            const offset = id * this.#elementsPerTransform;
            const matrix = new Matrix4().fromArray(transformArray, offset);

            // ! <hack/>
            // before the main thread starts pushing object matrices to the transform buffer,
            // there will be a period of time where `matrix` consists of entirely zeroes.
            // ThreeJS doesn't particularly like when scale elements are zero, so set them
            // to something else as a fix.
            if (matrix.elements[0] === 0) matrix.makeScale(1, 1, 1);

            object.matrix.copy(matrix);
        }
    }

    /** Emplaces raw texture data into a ThreeJS texture object */
    uploadTexture({
        imageId, imageDataBuffer, imageWidth, imageHeight, ui,
    }: GraphicsUploadTextureCmd) {
        const imageData = new Uint8Array(imageDataBuffer);
        const texture = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.magFilter = LinearFilter;
        // disable MipMapping for UI elements
        texture.minFilter = (ui ? LinearFilter : LinearMipMapLinearFilter);
        texture.generateMipmaps = true;
        texture.flipY = true;
        texture.needsUpdate = true;

        // console.log(imageId);
        // console.log(texture);
        this.#textureCache.set(imageId, texture);
    }

    /** Updates the material of a renderable object */
    updateMaterial({ material, id }: GraphicsUpdateMaterialCmd) {
        const mat = this.deserializeMaterial(material);
        const mesh = this.#idToObject.get(id)! as Mesh | Points | Sprite | GridHelper;
        mesh.material = mat;
    }

    /** Adds a renderable object to the scene */
    addObject({ id, data, ui }: GraphicsAddObjectCmd) {
        data.images = [];
        data.textures = [];

        // uuid -> Material
        const lookupTable = new Map<string, Material>();
        (data.materials as any[])
            ?.map(json => this.deserializeMaterial(json))
            .forEach(material => lookupTable.set(material.uuid, material));

        const object = new ObjectLoader().parse(data);

        if (false
            || object instanceof Mesh
            || object instanceof Points
            || object instanceof Sprite
            || object instanceof GridHelper
        ) {
            if (object.material instanceof Array) {
                // if the object has a list of materials (skybox), inject list of materials
                object.material = object.material.map(({ uuid }) => lookupTable.get(uuid)!);
            } else {
                // object has only one material - inject it
                object.material = lookupTable.get(object.material.uuid);
            }

            object.castShadow = true;
            object.receiveShadow = true;
        }
        else if (object instanceof Camera) {
            const helper = new CameraHelper(object);
            this.#scene.add(helper);
        }

        object.matrixAutoUpdate = false;
        (ui ? this.#uiscene : this.#scene).add(object);
        this.#idToObject.set(id, object);
    }

    /** Removes a renderable object from the scene */
    removeObject({ id }: GraphicsRemoveObjectCmd) {
        const object = this.#idToObject.get(id)!;
        this.#idToObject.delete(id);
        this.#scene.remove(object);
    }

    /** Resizes the render target */
    resize({ width, height }: GraphicsResizeCmd) {
        // console.log(`resize ${width} x ${height} @ ${pixelRatio}x scaling`);

        if (this.#camera instanceof PerspectiveCamera) {
            this.#camera.aspect = width / height;
            this.#camera.updateProjectionMatrix();
        }
        else if (this.#camera instanceof OrthographicCamera) {
            this.#uicamera.left = -width / 2;
            this.#camera.right = width / 2;
            this.#camera.top = height / 2;
            this.#camera.bottom = -height / 2;
            this.#camera.updateProjectionMatrix();
        }

        this.#uicamera.left = -width / 2;
        this.#uicamera.right = width / 2;
        this.#uicamera.top = height / 2;
        this.#uicamera.bottom = -height / 2;
        this.#uicamera.updateProjectionMatrix();

        this.#renderer.setSize(width, height, false);

        // For *WHATEVER REASON*, passing the pixel ratio actually messes shit up on HiDPI displays
        // this.#renderer.setPixelRatio(pixelRatio);
    }

    /** Takes a JSON material description and creates a tangible (textured) ThreeJS material */
    private deserializeMaterial(json: any) {
        // find all the keys in 'json' that correspond to texture properties
        const textureKeys = Object.getOwnPropertyNames(json)
            .filter(key => key.slice(-3).toLocaleLowerCase() === 'map')
            .filter(key => json[key] !== null);

        // then, create a map from [key -> uuid]
        const key_to_uuid = new Map<string, string>();
        textureKeys.forEach((key) => {
            key_to_uuid.set(key, json[key]);
        });

        // delete the keys from json so that MaterialLoader doesn't see them
        // (it will try to look up the texture uuid's, fail, and then complain)
        key_to_uuid.forEach((_, key) => delete json[key]);

        // parse the material JSON
        const material = new MaterialLoader().parse(json);

        // inject real textures into the material using the [key:uuid] map created above
        key_to_uuid.forEach((uuid, key) => {
            // @ts-ignore
            material[key] = this.#textureCache.get(uuid)!;
        });

        // this.#cascade.setupMaterial(material);

        return material;
    }
}
