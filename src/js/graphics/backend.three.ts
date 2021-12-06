/**
 * @see graphics.ts for information on how object transforms are communicated
 */

import {
    DataTexture,
    // GridHelper,
    LinearFilter,
    LinearMipMapLinearFilter,
    MaterialLoader,
    Matrix4,
    Mesh,
    MeshPhongMaterial,
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
} from 'three';

import {
    GraphicsAddObjectCmd,
    GraphicsInitCmd,
    GraphicsRemoveObjectCmd,
    GraphicsResizeCmd,
    GraphicsUpdateMaterialCmd,
    GraphicsUploadTextureCmd,
} from './commands';

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
    #camera = new PerspectiveCamera(60, 1, 0.1, 2000);

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

    /** number of elements per each transform matrix in the shared array buffer */
    readonly #elementsPerTransform = 16;

    init({ canvas, buffer }: GraphicsInitCmd) {
        const transformArray = new Float32Array(buffer);

        // typecast to WebGL1 context to satisfy ThreeJS' typings
        const context = canvas.getContext('webgl2', { antialias: true })! as WebGLRenderingContext;

        // initialize renderer instance
        this.#renderer = new WebGLRenderer({
            canvas,
            context,
            antialias: true,
        });
        this.#renderer.setClearColor(0x000000);
        this.#renderer.autoClear = false;
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = PCFSoftShadowMap;

        console.log(`ThreeJS backend v.${REVISION}`);

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

        // graphics thread render loop
        const render = () => {
            this.readTransformsFromArray(transformArray);

            this.#renderer.clear();
            this.#renderer.render(this.#scene, this.#camera);
            this.#renderer.clearDepth();
            this.#renderer.render(this.#uiscene, this.#uicamera);

            requestAnimationFrame(render);
        };

        // start rendering
        requestAnimationFrame(render);
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
            if (matrix.elements[0] === 0) matrix.makeScale(0.1, 0.1, 0.1);

            object.matrix.copy(matrix);
        }
    }

    /** Emplaces raw texture data into a ThreeJS texture object */
    uploadTexture({
        imageId, imageData, imageWidth, imageHeight, ui,
    }: GraphicsUploadTextureCmd) {
        const map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;
        map.magFilter = LinearFilter;
        map.minFilter = ui ? LinearFilter : LinearMipMapLinearFilter;
        map.generateMipmaps = true;
        map.flipY = true;
        map.needsUpdate = true;

        this.#textureCache.set(imageId, map);
    }

    /** Updates the material of a renderable object */
    updateMaterial({ material, id }: GraphicsUpdateMaterialCmd) {
        const mat = this.deserializeMaterial(material);

        const mesh = this.#idToObject.get(id)! as Mesh | Sprite;

        mesh.material = mat;
    }

    /** Adds a renderable object to the scene */
    addObject({ id, data, ui }: GraphicsAddObjectCmd) {
        data.images = [];
        data.textures = [];

        const matMap = new Map<string, MeshPhongMaterial>();
        if (data.materials) {
            for (const materialData of data.materials) {
                const mat = this.deserializeMaterial(materialData);
                matMap.set(mat.uuid, mat);
            }
        }

        const object = new ObjectLoader().parse(data);

        // if (object.children.length) console.log(data);

        if (object instanceof Mesh || object instanceof Sprite) {
            if (object.material.length) {
                const matList: MeshPhongMaterial[] = [];
                for (const mat of object.material) {
                    matList.push(matMap.get(mat.uuid)!);
                }
                object.material = matList;
            } else {
                object.material = matMap.get(object.material.uuid);
            }
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
    resize({ width, height, pixelRatio }: GraphicsResizeCmd) {
        // console.log(`resize ${width} x ${height} @ ${pixelRatio}x scaling`);

        this.#camera.aspect = width / height;
        this.#camera.updateProjectionMatrix();

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
        const {
            map, alphaMap, normalMap, specularMap,
        } = json;

        // [?] can this process be automated
        delete json.map; //
        delete json.matcap;
        delete json.alphaMap; //
        delete json.bumpMap;
        delete json.normalMap; //
        delete json.displacementMap;
        delete json.roughnessMap;
        delete json.metalnessMap;
        delete json.emissiveMap;
        delete json.specularMap; //
        delete json.envMap;
        delete json.lightMap;
        delete json.aoMap;

        const mat = new MaterialLoader().parse(json) as MeshPhongMaterial;

        // assign textures
        if (map) mat.map = this.#textureCache.get(map)!;
        if (alphaMap) mat.alphaMap = this.#textureCache.get(alphaMap)!;
        if (normalMap) mat.normalMap = this.#textureCache.get(normalMap)!;
        if (specularMap) mat.specularMap = this.#textureCache.get(specularMap)!;

        return mat;
    }
}
