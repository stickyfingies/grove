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
    Light,
    Material,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Scene,
    Sprite,
    Texture,
} from 'three';

// @ts-ignore - TSC doesn't understand Vite module ?queries
import Backend from './worker?worker';
import GraphicsUtils from './utils';
import { IGraphicsCommand } from './commands';

export type CameraData = PerspectiveCamera;
// eslint-disable-next-line no-redeclare
export const CameraData = PerspectiveCamera;

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
let log: LogFn = console.log;
let report: LogFn = console.error;

export class Graphics {
    /** Tree-like graph of renderable game objects */
    #scene = new Scene();

    /**
     * Map between mesh IDs and mesh instances
     *
     * @note mesh ID's are not the same as entity ID's, as we need a compact list of meshes,
     * but not all entities will have mesh components.
     */
    #idToObject = new Map<number, Object3D>();

    /**
     * Every time a mesh gets removed from the scene, we recycle its ID so that the list of meshes
     * stays compact.  Recycled, unused IDs go into this list.
     */
    #availableObjectIds: number[] = [];

    /**
     * Next available mesh ID
     * @note when assigning ID's, recycle any ID's from `#availableObjectIds` first
     */
    #objectId = 0;

    /** Set of all texture UUID's that have already been uploaded to the backend */
    #textureCache = new Set<string>();

    /** Queue of commands to be submitted to the backend */
    #commandQueue: IGraphicsCommand[] = [];

    /** Worker thread handle on which the graphics backend is ran */
    #worker = new Backend();

    /** Cross-thread buffer of mesh transforms */
    #buffer: SharedArrayBuffer;

    /** f32 array view over #buffer, used for raw access */
    #array: Float32Array;

    /**
     * This camera acts as a proxy for the actual rendering camera in the backend
     * @note camera has id #0
     */
    #camera = new PerspectiveCamera();

    /** Number of bytes per each element in the shared array buffer */
    readonly #bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

    /** Number of elements per each matrix in the transform buffer (4x4 matrix = 16) */
    readonly #elementsPerTransform = 16;

    /** Maximum number of meshes whcih may exist concurrently */
    readonly #maxEntityCount = 1024;

    /** Calculates the size of the transform buffer */
    get #bufferSize() {
        return this.#bytesPerElement * this.#elementsPerTransform * this.#maxEntityCount;
    }

    get camera() {
        return this.#camera;
    }

    constructor(logService?: LogFn[]) {
        if (logService) [log, report] = logService;
        if (typeof SharedArrayBuffer === 'undefined') {
            report('SharedArrayBuffer not supported');
        }
        this.#buffer = new SharedArrayBuffer(this.#bufferSize);
        this.#array = new Float32Array(this.#buffer);
    }

    init() {
        this.assignIdToObject(this.#camera);
        this.#scene.add(this.#camera);

        const offscreenCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
        // @ts-ignore - Some DOM typing bull-shit
        const offscreen = offscreenCanvas.transferControlToOffscreen();

        this.submitCommand({
            type: 'init',
            buffer: this.#buffer,
            canvas: offscreen,
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

        log('┍ Init')
    }

    update() {
        this.flushCommands();
        this.writeTransformsToArray();
    }

    /**
     * Upload queued graphics commands to backend & clear queue
     */
    flushCommands() {
        for (const cmd of this.#commandQueue) this.#worker.postMessage(cmd);
        this.#commandQueue = [];
    }

    /**
     * Changes to material properties made by game code are not automatically mirrored by
     * the backend, so materials need to be manually flushed after updates
     * @note Broken for groups
     */
    updateMaterial(object: Mesh | Sprite, ui = false) {
        object.traverse((node) => {
            if (node instanceof Mesh || node instanceof Sprite) {
                this.extractMaterialTextures(node.material as Material, ui);

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
    private submitCommand(cmd: IGraphicsCommand, immediate = false, transfer?: OffscreenCanvas) {
        if (immediate) {
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
                this.#idToObject.delete(id);
                this.#availableObjectIds.push(id);
            }
        });
    }

    /**
     * Flush all renderable objects' transforms to the shared transform buffer
     */
    private writeTransformsToArray() {
        this.#scene.updateMatrixWorld();

        // for every renderable...
        for (const [id, object] of this.#idToObject) {
            // calculate offset into array given mesh ID
            const offset = id * this.#elementsPerTransform;

            // copy world matrix into transform buffer
            for (let i = 0; i < this.#elementsPerTransform; i++) {
                this.#array[offset + i] = object.matrixWorld.elements[i];
            }
        }
    }

    /**
     * Smart algorithm for assigning ID's to renderable objects by reusing ID's from old, removed
     * objects first, and generating a new ID only if no recyclable ID's exist.
     */
    private assignIdToObject(object: Object3D): number {
        let id = this.#objectId;

        // pick a recycled ID if one is available
        if (this.#availableObjectIds.length > 0) {
            id = this.#availableObjectIds.shift()!;
        } else {
            this.#objectId += 1;
            if (this.#objectId > this.#maxEntityCount) {
                report(`exceeded maximum object count: ${this.#maxEntityCount}`);
                debugger;
            }
        }

        // set mesh/ID relationships
        this.#idToObject.set(id, object);
        object.userData.meshId = id;

        return id;
    }

    /**
     * Ship a texture to the graphics backend, but only if the texture has not already been uploaded
     */
    private uploadTexture(map: Texture, ui: boolean) {
        if (this.#textureCache.has(map.uuid)) return; // image is already cached

        const { image, uuid } = map;
        const { width, height } = image;

        // grab raw image data from the texture
        const { ctx } = GraphicsUtils.scratchCanvasContext(width, height);
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        this.#textureCache.add(uuid);

        this.submitCommand({
            type: 'uploadTexture',
            imageId: uuid,
            imageData: imageData.data,
            imageWidth: width,
            imageHeight: height,
            ui,
        });
    }

    private extractMaterialTextures(material: Material, ui: boolean) {
        // @ts-ignore - properties may not exist, but I check for that
        const { map, alphaMap } = material;
        if (map) this.uploadTexture(map, ui);
        if (alphaMap) this.uploadTexture(alphaMap, ui);
    }

    /**
     * Upload a renderable object to the graphics backend.
     * Establishing a scene hierarchy is possible by specifying `object.parent`
     *
     * Current supported objects: `Mesh`, `Sprite`, `Light`
     */
    addObjectToScene(object: Object3D, ui = false) {
        if (object.parent) object.parent.add(object);
        else this.#scene.add(object);

        object.traverse((node) => {
            if (node instanceof Mesh || node instanceof Sprite || node instanceof Light) {
                const id = this.assignIdToObject(node);

                if ('material' in node) {
                    if (node.material instanceof Material) {
                        // object only has one material
                        this.extractMaterialTextures(node.material, ui);
                    } else {
                        // object has several materials
                        for (const material of node.material) {
                            this.extractMaterialTextures(material, ui);
                        }
                    }
                }

                // send that bitch to the backend
                this.submitCommand({
                    type: 'addObject',
                    data: node.toJSON(),
                    id,
                    ui,
                });
            }
        });
    }
}
