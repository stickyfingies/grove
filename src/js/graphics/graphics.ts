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
    Material,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Sprite,
    Texture,
    Vector2,
} from 'three';

import Engine from '../engine';
import Entity from '../ecs/entity';
import GraphicsUtils from './utils';
import { IGraphicsCommand } from './commands';

export type CameraData = PerspectiveCamera;
// eslint-disable-next-line no-redeclare
export const CameraData = PerspectiveCamera;
export type GraphicsData = Object3D;
// eslint-disable-next-line no-redeclare
export const GraphicsData = Object3D;
export type UiData = Sprite;
// eslint-disable-next-line no-redeclare
export const UiData = Sprite;

/**
 * Entity tag used to retrieve the main camera
 * @example Entity.getTag(CAMERA_TAG)
 */
export const CAMERA_TAG = Symbol('camera');

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
    objectId = 0;

    /** Set of all texture UUID's that have already been uploaded to the backend */
    #textureCache = new Set<string>();

    /** Queue of commands to be submitted to the backend */
    #commandQueue: IGraphicsCommand[] = [];

    /** Worker thread handle on which the graphics backend is ran */
    #worker = new Worker(new URL('./worker.ts', import.meta.url));

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
    get bufferSize() {
        return this.#bytesPerElement * this.#elementsPerTransform * this.#maxEntityCount;
    }

    constructor() {
        this.#buffer = new SharedArrayBuffer(this.bufferSize);
        this.#array = new Float32Array(this.#buffer);
    }

    init(engine: Engine) {
        engine.gui.add(this, 'objectId').listen();

        // make camera accessible through game entity
        new Entity(engine.ecs)
            .addTag(CAMERA_TAG)
            .setComponent(CameraData, this.#camera);
        this.assignIdToObject(this.#camera);

        // TODO too implicit: { entity.setComponent() => [event blackbox] => addObjectToScene() }
        // TODO prefer: { mesh = graphics.makeObject(); entity.setComponent(mesh); }
        // listen to component events
        engine.ecs.events.on(`set${GraphicsData.name}Component`, (entityId: number, object: GraphicsData) => {
            this.addObjectToScene(entityId, object, false);
        });
        engine.ecs.events.on(`delete${GraphicsData.name}Component`, (id: number, object: GraphicsData) => {
            this.removeFromScene(object);
        });
        engine.ecs.events.on(`set${UiData.name}Component`, (entityId: number, object: UiData) => {
            this.addObjectToScene(entityId, object, true);
        });
        engine.ecs.events.on(`delete${UiData.name}Component`, (id: number, object: UiData) => {
            this.removeFromScene(object);
        });

        const offscreenCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
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
     */
    updateMaterial(object: Mesh | Sprite) {
        this.extractMaterialTextures(object.material as Material);

        this.submitCommand({
            type: 'updateMaterial',
            material: (object.material as Material).toJSON(),
            id: object.userData.meshId,
        });
    }

    raycast() {
        const raycaster = new Raycaster();
        raycaster.setFromCamera(new Vector2(), this.#camera);

        return raycaster.intersectObjects(Array.from(this.#idToObject.values()));
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

    private removeFromScene(object: Object3D) {
        const id = object.userData.meshId;

        // inform the graphics backend
        this.submitCommand({
            type: 'removeObject',
            id,
        });

        // recycle ID
        this.#idToObject.delete(id);
        this.#availableObjectIds.push(id);
    }

    /**
     * Flush all renderable objects' transforms to the shared transform buffer
     */
    private writeTransformsToArray() {
        // for every renderable...
        for (const [id, object] of this.#idToObject) {
            // calculate offset into array given mesh ID
            const offset = id * this.#elementsPerTransform;

            // copy world matrix into transform buffer
            object.updateMatrixWorld();
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
        let id = this.objectId;

        // pick a recycled ID if one is available
        if (this.#availableObjectIds.length > 0) {
            id = this.#availableObjectIds.shift()!;
        } else {
            this.objectId += 1;
            if (this.objectId > this.#maxEntityCount) {
                throw new Error(`[graphics] exceeded maximum object count: ${this.#maxEntityCount}`);
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
    private uploadTexture(map: Texture) {
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
        });
    }

    private extractMaterialTextures(material: Material) {
        // @ts-ignore - properties may not exist, but I check for that
        const { map, alphaMap } = material;
        if (map) this.uploadTexture(map);
        if (alphaMap) this.uploadTexture(alphaMap);
    }

    /**
     * Upload a renderable object to the graphics backend.
     * Establishing a scene hierarchy is possible by specifying `object.parent`
     *
     * Current supported objects: `Mesh`, `Sprite`, `Light`
     */
    private addObjectToScene(entityId: number, object: Object3D, ui = false) {
        if (object.parent) object.parent.add(object);
        else this.#scene.add(object);

        if (object.userData.poop) return;

        const id = this.assignIdToObject(object);
        object.userData.entityId = entityId;

        object.traverse((node) => {
            if (node instanceof Mesh || node instanceof Sprite) {
                if (node.material instanceof Material) {
                    // object only has one material
                    this.extractMaterialTextures(node.material);
                } else {
                    // object has several materials
                    for (const material of node.material) {
                        this.extractMaterialTextures(material);
                    }
                }
            }
        });

        // send that bitch to the backend
        this.submitCommand({
            type: 'addObject',
            data: object.toJSON(),
            id,
            ui,
        });
    }
}
