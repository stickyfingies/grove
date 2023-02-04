import { BufferGeometry } from 'three';
import Backend from './worker?worker';
import { PhysicsEngine, Vec3, Workload, Transform, RigidBodyDescription, SphereShapeDescription, CapsuleShapeDescription, TriangleMeshShapeDescription } from './header';
import EventEmitter from 'events';

export { RigidBodyDescription } from './header';
export type { Vec3, Quat } from './header';

/***********************************\
 *               !
 * I hate this with all my passion *
\***********************************/
export function _threejs_geometry_to_buffer(geometry: BufferGeometry) {
    const nonIndexedGeo = geometry.index ? geometry.toNonIndexed() : geometry;
    const positionsArray = nonIndexedGeo.getAttribute('position').array as Float32Array;
    return positionsArray.buffer;
}

/* --------------------------------- TYPES --------------------------------- */

type RigidBodyID
    = number
    ;
type RaycastCallback
    = (i: RaycastResult | null) => void
    ;
type LogFn
    = (payload: object | string | number) => void
    ;

type TransformBuffer = {
    buffer: SharedArrayBuffer;
    view: Float32Array;
    readonly elementsPerMatrix: number;
};

class Storage {
    transform: TransformBuffer;

    capacity: number;

    /**
     * Every time an object gets removed from the scene, we recycle its index in the
     * storage buffer so our array of data stays compact.
     */
    #availableIndices: number[] = [];

    /**
     * Next available ID
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
    insert(): number {
        let id = this.#objectId;

        // pick a recycled ID if one is available
        if (this.#availableIndices.length > 0) {
            id = this.#availableIndices.shift()!;
        } else {
            this.#objectId += 1;
            if (this.#objectId > this.capacity) {
                report(`exceeded maximum object count: ${this.capacity}`);
                debugger;
            }
        }

        return id;
    }

    remove(id: number) {
        this.#availableIndices.push(id);
    }
}

/* -------------------------------- GLOBALS -------------------------------- */

let [log, report]
    : LogFn[]
    = [console.log, console.error]
    ;
let [workerLog, workerReport]
    : LogFn[]
    = [console.log, console.error]
    ;

/* ------------------------------ PUBLIC TYPES ----------------------------- */

export type RaycastResult
    =
    {
        entityID: number, // the entity hit by the raycast
        hitPoint: Vec3 // hitpoint lcoation in worldspace
    }
    ;
export type CollisionCallback
    =
    (entity: number) => void
    ;

/* ----------------------------- PUBLIC CLASSES ---------------------------- */

export class PhysicsData { constructor(public id: number) { } }
export class Physics implements PhysicsEngine<PhysicsData> {
    #worker: Worker;

    #raycastIdCounter = 0;

    /** Raw buffer containing RigidBody transform data. */
    #storage = new Storage(1024);

    /** Map of RigidBody ID's to Entity ID's */
    #idToEntity = new Map<RigidBodyID, number>();

    #collisionCallbacks = new Map<RigidBodyID, CollisionCallback>();

    #raycastCallbacks = new Map<number, RaycastCallback>();

    #work = new Workload<PhysicsData>();

    constructor() {
        this.#worker = new Backend();
    }

    async init(events: EventEmitter, logService?: LogFn[], workerLogService?: LogFn[]) {
        if (logService) {
            [log, report] = logService;
            [workerLog, workerReport] = logService; //
        }
        if (workerLogService) [workerLog, workerReport] = workerLogService;

        log(`${import.meta.url}`);

        events.on(`set${PhysicsData.name}Component`, ({ entity_id, data }) => {
            this.#idToEntity.set(data.id, entity_id);
        });
        events.on(`delete${PhysicsData.name}Component`, ({ data }) => {
            this.removeBody(data);
        });

        return new Promise<void>((resolve) => {
            this.#worker.onerror = workerReport;
            this.#worker.onmessage = ({ data }) => {
                switch (data.type) {
                    case 'log': {
                        workerLog(data.message);
                        break;
                    }
                    case 'ready': {
                        log('Ready');
                        // This is the backend saying, "libraries loaded and ready to go!"
                        this.#worker.postMessage({
                            type: 'init',
                            buffer: this.#storage.transform.buffer
                        });
                        resolve();
                        break;
                    }
                    case 'collisions': {
                        // List of collisions that take place every tick
                        const { collisions } = data;
                        for (let i = 0; i < collisions.length; i += 2) {
                            const rbId0 = collisions[i + 0];
                            const rbId1 = collisions[i + 1];

                            const id0 = this.#idToEntity.get(rbId0)!;
                            const id1 = this.#idToEntity.get(rbId1)!;

                            events.emit('collision', { id0, id1 });
                            this.#collisionCallbacks.get(rbId0)?.(id1);
                        }
                        break;
                    }
                    case 'raycastResult': {
                        // Results from a raycast request
                        const { raycastId, bodyId, hitPoint } = data;
                        const didHit = (bodyId !== -1);
                        if (didHit) {
                            const entityID = this.#idToEntity.get(bodyId)!;
                            const { x, y, z } = hitPoint;
                            this.#raycastCallbacks.get(raycastId)!({
                                entityID,
                                hitPoint: [x, y, z],
                            });
                        }
                        else {
                            this.#raycastCallbacks.get(raycastId)!(null);
                        }
                        break;
                    }
                    default: {
                        report(`Unknown message type ${data.type}`);
                    }
                }
            };
        });
    }

    update(_deltaTime?: number) {
        this.#worker.postMessage({
            type: 'workload',
            work: this.#work
        });

        this.#work = new Workload();
    }

    getBodyPosition({ id }: PhysicsData): Vec3 {
        const offset = 3 * id;
        return Array.from(this.#storage.transform.view.slice(offset, offset + 3)) as Vec3;
    }

    registerCollisionCallback({ id }: PhysicsData, cb: CollisionCallback) {
        this.#collisionCallbacks.set(id, cb);
    }

    removeCollisionCallback({ id }: PhysicsData) {
        this.#collisionCallbacks.delete(id);
    }

    addForce(object: PhysicsData, vector: Vec3) {
        this.#work.forces.push({
            object,
            vector
        });
    }

    addForceConditionalRaycast(object: PhysicsData, vector: Vec3, from: Vec3, to: Vec3) {
        this.#work.force_raycasts.push({
            force: { object, vector },
            raycast: { id: 0, from, to }
        });
    }

    addVelocity(object: PhysicsData, vector: Vec3) {
        this.#work.velocities.push({
            object,
            vector
        });
    }

    /** Adds velocity to a RigidBody ONLY if raycast returns a hit */
    addVelocityConditionalRaycast(object: PhysicsData, vector: Vec3, from: Vec3, to: Vec3) {
        this.#work.velocity_raycasts.push({
            velocity: { object, vector },
            raycast: { id: 0, from, to }
        });
    }

    /** Casts a ray, and returns either the entity ID that got hit or undefined. */
    raycast(from: Vec3, to: Vec3) {
        return new Promise<RaycastResult | null>((resolve) => {
            const id = this.#raycastIdCounter;
            this.#raycastIdCounter += 1;

            this.#raycastCallbacks.set(id, resolve);

            this.#work.raycasts.push({ id, from, to });
        });
    }

    removeBody({ id }: PhysicsData) {
        this.#storage.remove(id);
        this.#worker.postMessage({
            type: 'removeBody',
            id,
        });
    }

    createTrimesh(opts: RigidBodyDescription, transform: Transform, geometry: TriangleMeshShapeDescription): PhysicsData {
        const id = this.#storage.insert();

        // optimization: extract underlying buffer from the ThreeJS BufferAttribute
        // so that it can be moved to the worker thread, instead of copied.

        this.#worker.postMessage({
            type: 'createTrimesh',
            geometry,
            pos: transform.pos ?? [0, 0, 0],
            scale: transform.scale ?? [1, 1, 1],
            quat: transform.quat ?? [0, 0, 0, 1],
            mass: 0,
            id,
        }, []);

        return { id };
    }

    createPlane(opts: RigidBodyDescription, transform: Transform) {
        const id = this.#storage.insert();

        this.#worker.postMessage({
            type: 'createPlane',
            mass: opts.mass,
            pos: transform.pos ?? [0, 0, 0],
            scale: transform.scale ?? [1, 1, 1],
            quat: transform.quat ?? [0, 0, 0, 1],
            shouldRotate: opts.shouldRotate ?? true,
            id,
        });

        return { id };
    }

    createSphere(opts: RigidBodyDescription, transform: Transform, shape: SphereShapeDescription): PhysicsData {
        const id = this.#storage.insert();

        this.#worker.postMessage({
            type: 'createSphere',
            radius: shape.radius,
            mass: opts.mass,
            pos: transform.pos ?? [0, 0, 0],
            scale: transform.scale ?? [1, 1, 1],
            quat: transform.quat ?? [0, 0, 0, 1],
            isGhost: opts.isGhost,
            shouldRotate: opts.shouldRotate ?? true,
            id,
        });

        return { id };
    }

    createCapsule(opts: RigidBodyDescription, transform: Transform, shape: CapsuleShapeDescription): PhysicsData {
        const id = this.#storage.insert();

        this.#worker.postMessage({
            type: 'createCapsule',
            radius: shape.radius,
            height: shape.height,
            mass: opts.mass,
            pos: transform.pos ?? [0, 0, 0],
            scale: transform.scale ?? [1, 1, 1],
            quat: transform.quat ?? [0, 0, 0, 1],
            shouldRotate: opts.shouldRotate ?? true,
            id,
        });

        return { id };
    }
}
