/**
 * ===========================
 * Adding and Removing Objects
 * ===========================
 *
 * The situation is a little complicated, but it effectively works like this:
 *
 * Every time we create an object, we associate it with a unique ID that we can use to set/retrieve
 * its transform info from the shared array buffer.  When we delete an object, we recycle its ID, so
 * that future entities can reuse that slot in the shared buffer.  We do this by adding the removed
 * entity's ID to a list, `availableEntityIds`.  Whenever a new entity is added to the scene, we
 * first check that list to see if we can recycle any old, unused entity IDs.  If we cannot do that,
 * we increment a global counter and use that as the entity's ID - effectively, putting it at the
 * end of the shared array buffer.
 */

import {
    Camera,
    Group,
    InstancedMesh,
    Light,
    Material,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    Sprite,
    Texture,
} from 'three';

// @ts-ignore - TSC doesn't understand Vite module ?queries
import Backend from './worker?worker';
import GraphicsUtils from './utils';
import { IGraphicsCommand } from './commands';

export type CameraData = Camera;
// eslint-disable-next-line no-redeclare
export const CameraData = Camera;

export type MeshData = Mesh;
// eslint-disable-next-line no-redeclare
export const MeshData = Mesh;

export type SpriteData = Sprite;
// eslint-disable-next-line no-redeclare
export const SpriteData = Sprite;

export type LightData = Light;
// eslint-disable-next-line no-redeclare
export const LightData = Light;

/**
 * Entity tag used to retrieve the main camera
 * @example Entity.getTag(CAMERA_TAG)
 */
export const CAMERA_TAG = Symbol('camera');

type LogFn = (payload: object | string | number) => void;
let [log, report]: LogFn[] = [console.log, console.error];
let [workerLog, workerReport]: LogFn[] = [console.log, console.error];

type Transform = {
    buffer: SharedArrayBuffer;
    view: Float32Array;
    readonly elementsPerMatrix: number;
};

class Storage {
    transform: Transform;

    objects: Object3D[] = [];

    capacity: number;

    /**
     * Every time a mesh gets removed from the scene, we recycle its index in the
     * storage buffer so our array of data stays compact.
     */
    availableIndices: number[] = [];

    /**
     * Next available mesh ID
     * @note when assigning ID's, recycle any ID's from `#availableIndices` first
     */
    #objectId = 0;

    constructor(maxEntityCount: number) {
        this.capacity = maxEntityCount;
        if (typeof SharedArrayBuffer === 'undefined') {
            report('SharedArrayBuffer not supported');
        }
        const bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
        const elementsPerMatrix = 16;
        const bufferSize = bytesPerElement * elementsPerMatrix * maxEntityCount;
        const buffer = new SharedArrayBuffer(bufferSize);
        const view = new Float32Array(buffer);
        this.transform = { buffer, view, elementsPerMatrix };
    }

    /**
    * Smart algorithm for assigning ID's to renderable objects by reusing ID's from old, removed
    * objects first, and generating a new ID only if no recyclable ID's exist.
    */
    add(object: Object3D): number {
        let id = this.#objectId;

        // pick a recycled ID if one is available
        if (this.availableIndices.length > 0) {
            id = this.availableIndices.shift()!;
        } else {
            this.#objectId += 1;
            if (this.#objectId > this.capacity) {
                report(`exceeded maximum object count: ${this.capacity}`);
                debugger;
            }
        }

        // set mesh/ID relationships
        object.userData.meshId = id;
        this.objects[id] = object;

        return id;
    }

    remove(id: number) {
        this.availableIndices.push(id);
    }
}

export class Graphics {
    /** Tree-like graph of renderable game objects */
    #scene = new Scene();

    get scene() { return this.#scene; }

    /** Set of all texture UUID's that have already been uploaded to the backend */
    #textureCache = new Set<string>();

    /** Queue of commands to be submitted to the backend */
    #commandQueue: IGraphicsCommand[] = [];

    /** Worker thread handle on which the graphics backend is ran */
    #worker: Worker;

    /** Cross-thread buffer of mesh transforms */
    #storage: Storage;

    /**
     * This camera acts as a proxy for the actual rendering camera in the backend
     * @note camera has id #0
     */
    #camera = new PerspectiveCamera();

    get camera() {
        return this.#camera;
    }

    constructor(logService?: LogFn[], workerLogService?: LogFn[]) {
        // inject logging functions
        if (logService) {
            [log, report] = logService;
            [workerLog, workerReport] = workerLogService ?? logService;
        }

        // Useful for debugging the library itself
        log(import.meta.url);

        this.#storage = new Storage(1024);

        this.#worker = new Backend();
        this.#worker.onmessage = ({ data }) => {
            switch (data.type) {
                case 'log': {
                    workerLog(data.message);
                    break;
                }
                case 'report': {
                    workerReport(data.message);
                    break;
                }
                default: {
                    // should NEVER happen in production.
                    report(`Unknown message type ${data.type}`);
                    break;
                }
            }
        }
    }

    /**
     * Initialize the whole graphics stack.  This starts communication with
     * the worker thread, attaches listeners, and creates the canvas.
     * 
     * @param canvasID ID of HTMLCanvasElement to render to.
     *                 Creates a new element if one cannot be found.
     */
    init(canvasID: string = 'main-canvas') {
        this.#storage.add(this.#camera);
        this.#scene.add(this.#camera);

        // find (or create) canvas element
        let offscreenCanvas = document.getElementById(canvasID) as HTMLCanvasElement | null;
        if (!offscreenCanvas) {
            offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.setAttribute('id', canvasID);
            document.body.appendChild(offscreenCanvas);
        }
        // @ts-ignore - Some DOM typing bull-shit
        const offscreen = offscreenCanvas.transferControlToOffscreen();

        this.submitCommand({
            type: 'init',
            buffer: this.#storage.transform.buffer,
            canvas: offscreen,
            // @ts-ignore - OffscreenCanvas BS
        }, true, offscreen);

        this.submitCommand({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
        });

        // attach graphics backend to resize event hook
        window.addEventListener('resize', () => {
            this.submitCommand({
                type: 'resize',
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio,
            });
        });
    }

    update() {
        this.flushCommands();
        this.writeTransformsToArray();
    }

    /**
     * Upload queued graphics commands to backend & clear queue
     */
    flushCommands() {
        for (const cmd of this.#commandQueue) {
            this.#worker.postMessage(cmd);
        }
        this.#commandQueue = [];
    }

    changeCamera(camera: Camera) {
        this.submitCommand({
            type: 'changeCamera',
            camera_id: camera.userData.meshId
        });
        log(camera.userData.meshId);
    }

    /**
     * Changes to material properties made by game code are not automatically mirrored by
     * the backend, so materials need to be manually flushed after updates
     * @note Broken for groups
     */
    updateMaterial(object: Mesh | Points | Sprite, ui = false) {
        object.traverse((node) => {
            if (node instanceof Mesh || node instanceof Points || node instanceof Sprite) {
                this.extractMaterialTextures(node.material, ui);

                this.submitCommand({
                    type: 'updateMaterial',
                    material: (node.material as Material).toJSON(),
                    id: node.userData.meshId,
                });
            }
        });
    }

    /**
     * Submit a command to the backend.  Note that unless `immediate` is set to true, the commands
     * will actually be queued until the next call to `flushCommands()`.
     */
    private submitCommand(cmd: IGraphicsCommand, immediate = false, transfer?: Transferable) {
        if (immediate) {
            // @ts-ignore - dumb TS doesn't realize you can transfer an OffscreenCanvas
            this.#worker.postMessage(cmd, transfer ? [transfer] : undefined);
        } else {
            this.#commandQueue.push(cmd);
        }
    }

    removeObjectFromScene(object: Object3D) {
        object.traverse((node) => {
            if (node.userData.meshId) {
                const id = node.userData.meshId;

                // inform the graphics backend
                this.submitCommand({
                    type: 'removeObject',
                    id,
                });

                // recycle ID
                this.#storage.remove(id);
            }
        });
    }

    createParticleEmitter(map: Texture) {
        this.uploadTexture(map, false);

        const emitter = new Object3D();
        this.#scene.add(emitter);
        const id = this.#storage.add(emitter);

        this.submitCommand({
            type: 'createParticleSystem',
            texture_id: map.uuid,
            emitter_id: id,
            particle_count: 1_000
        });

        return emitter;
    }

    /**
     * Flush all renderable objects' transforms to the shared transform buffer
     */
    private writeTransformsToArray() {
        this.#scene.updateMatrixWorld();

        // for every renderable...
        for (let id = 0; id < this.#storage.objects.length; id++) {
            const offset = id * this.#storage.transform.elementsPerMatrix;
            for (let i = 0; i < this.#storage.transform.elementsPerMatrix; i++) {
                this.#storage.transform.view[offset + i] = this.#storage.objects[id].matrixWorld.elements[i];
            }
        }
    }

    /**
     * Ship a texture to the graphics backend, but only if the texture has not already been uploaded
     */
    private uploadTexture(texture: Texture, ui: boolean) {
        if (this.#textureCache.has(texture.uuid)) return;
        this.#textureCache.add(texture.uuid);

        const imageData = GraphicsUtils.getRawImageData(texture.image);

        this.submitCommand({
            type: 'uploadTexture',
            imageId: texture.uuid,
            imageDataBuffer: imageData.data.buffer,
            imageWidth: texture.image.width,
            imageHeight: texture.image.height,
            ui,
        }, true, imageData.data.buffer);
    }

    private extractMaterialTextures(material: ShaderMaterial, ui: boolean) {
        // find all properties that end with the word 'map'
        // (ThreeJS uses this naming convention for textures)
        (Object.getOwnPropertyNames(material) as (keyof Material)[])
            .filter(key => (key.slice(-3).toLocaleLowerCase() === 'map') && (material[key] !== null))
            .map(key => material[key] as Texture)
            .forEach(texture => {
                this.uploadTexture(texture, ui);
                delete texture.image;
            });

        if (material.uniforms) {
            Object.getOwnPropertyNames(material.uniforms)
                .map(key => material.uniforms[key])
                .forEach(uniform => {
                    if (uniform.value && uniform.value instanceof Texture) this.uploadTexture(uniform.value, ui);
                });
        }
    }

    /**
     * Upload a renderable object to the graphics backend.
     * Establishing a scene hierarchy is possible by specifying `object.parent`
     *
     * Current supported objects: `Mesh`, `Sprite`, `Light`
     */
    addObjectToScene(object: Mesh | InstancedMesh | Light | Sprite | Group, ui = false) {
        // place object in scene heirarchy
        if (object.parent) object.parent.add(object);
        else this.#scene.add(object);

        // loop through object's internal heirarchy & upload all renderables to backend
        object.traverse((node) => {
            // debugger;
            if (!(node instanceof Group)) {
                const id = this.#storage.add(node);

                if ('material' in node) {
                    // Get a list of all the materials in this object/scene_node
                    let materials = [];
                    // @ts-ignore
                    if (node.material instanceof Material) materials = [node.material];
                    // @ts-ignore
                    else materials = node.material;

                    for (const material of materials) {
                        this.extractMaterialTextures(material, ui);
                    }
                }

                // A very expensive call if `node.material` contains images.
                const json = node.toJSON();

                // send that bitch to the backend
                this.submitCommand({
                    type: 'addObject',
                    data: json,
                    id,
                    ui,
                });
            }
        });
    }
}
