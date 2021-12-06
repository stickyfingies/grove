import { BufferGeometry } from 'three';
import {
    Body,
    Box,
    Cylinder,
    PointToPointConstraint,
    Quaternion,
    Sphere,
    Vec3,
} from 'cannon-es';

import Engine from './engine';

export const PhysicsData = Body;
// eslint-disable-next-line no-redeclare
export type PhysicsData = Body;
export const ConstraintData = PointToPointConstraint;
// eslint-disable-next-line no-redeclare
export type ConstraintData = PointToPointConstraint;

export type RaycastInfo = {
    entityID: number, // the entity hit by the raycast
    hitPoint: Vec3 // hitpoint lcoation in worldspace
}

export type RigidBodyOptions = {
    pos?: Vec3,
    scale?: Vec3,
    quat?: Quaternion,
    mass?: number,
    fixedRotation?: boolean
}

export class CollisionEvent {
    id0!: number;

    id1!: number;
}

export class AddForceConditionalRaycast {
    body!: Body;

    force!: Vec3;

    from!: Vec3;

    to!: Vec3;
}

export type CollisionCallback = (entity: number) => void;

type RaycastCallback = (i: RaycastInfo) => void;

type RigidBodyID = number;

export class Physics {
    #worker: Worker;

    /** A counter that gets incremented when a new ID needs to be allocated. */
    #idCounter: RigidBodyID = 0;

    #raycastIdCounter = 0;

    /** Raw buffer containing RigidBody transform data. */
    #tbuffer = new SharedArrayBuffer(4 * 16 * 1024);

    #tview = new Float32Array(this.#tbuffer);

    #idToBody = new Map<RigidBodyID, Body>();

    #bodyToId = new WeakMap<Body, RigidBodyID>();

    /** Map of RigidBody ID's to Entity ID's */
    #idToEntity = new Map<RigidBodyID, number>();

    #collisionCallbacks = new Map<RigidBodyID, CollisionCallback>();

    #raycastCallbacks = new Map<number, RaycastCallback>();

    constructor() {
        this.#worker = new Worker(new URL('./physicsworker.ts', import.meta.url));
    }

    async init(engine: Engine) {
        engine.ecs.events.on(`set${PhysicsData.name}Component`, (entityId: number, body: PhysicsData) => {
            const bodyId = this.#bodyToId.get(body)!;
            this.#idToEntity.set(bodyId, entityId);
        });
        engine.ecs.events.on(`delete${PhysicsData.name}Component`, (entityId: number, body: PhysicsData) => {
            this.removeBody(body);
        });

        return new Promise<void>((resolve) => {
            this.#worker.onmessage = ({ data }) => {
                switch (data.type) {
                case 'ready': {
                    // This is the backend saying, "libraries loaded and ready to go!"
                    this.#worker.postMessage({ type: 'init', buffer: this.#tbuffer });
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

                        engine.ecs.events.emit('collision', { id0, id1 });
                        this.#collisionCallbacks.get(rbId0)?.(id1);
                    }
                    break;
                }
                case 'raycastResult': {
                    // Results from a raycast request
                    const { raycastId, bodyId, hitPoint } = data;
                    const entityID = this.#idToEntity.get(bodyId)!;
                    const { x, y, z } = hitPoint;
                    this.#raycastCallbacks.get(raycastId)!({
                        entityID,
                        hitPoint: new Vec3(x, y, z),
                    });
                    break;
                }
                default: {
                    throw new Error(`[physics] unknown message type ${data.type}`);
                }
                }
            };
        });
    }

    update(delta: number) {
        for (const [id, body] of this.#idToBody) {
            const offset = 3 * id;
            body.position.x = this.#tview[offset + 0];
            body.position.y = this.#tview[offset + 1];
            body.position.z = this.#tview[offset + 2];
        }
    }

    registerCollisionCallback(body: Body, cb: CollisionCallback) {
        const id = this.#bodyToId.get(body)!;
        this.#collisionCallbacks.set(id, cb);
    }

    removeCollisionCallback(body: Body) {
        const id = this.#bodyToId.get(body)!;
        this.#collisionCallbacks.delete(id);
    }

    addForce(body: Body, force: Vec3) {
        this.#worker.postMessage({
            type: 'addForce',
            id: this.#bodyToId.get(body),
            x: force.x,
            y: force.y,
            z: force.z,
        });
    }

    addForceConditionalRaycast(body: Body, force: Vec3, from: Vec3, to: Vec3) {
        this.#worker.postMessage({
            type: 'addForceConditionalRaycast',
            id: this.#bodyToId.get(body),
            x: force.x,
            y: force.y,
            z: force.z,
            fx: from.x,
            fy: from.y,
            fz: from.z,
            tx: to.x,
            ty: to.y,
            tz: to.z,
        });
    }

    addVelocity(body: Body, velocity: Vec3) {
        this.#worker.postMessage({
            type: 'addVelocity',
            id: this.#bodyToId.get(body),
            x: velocity.x,
            y: velocity.y,
            z: velocity.z,
        });
    }

    /** Adds velocity to a RigidBody ONLY if raycast returns a hit */
    addVelocityConditionalRaycast(body: Body, velocity: Vec3, from: Vec3, to: Vec3) {
        this.#worker.postMessage({
            type: 'addVelocityConditionalRaycast',
            id: this.#bodyToId.get(body),
            vx: velocity.x,
            vy: velocity.y,
            vz: velocity.z,
            fx: from.x,
            fy: from.y,
            fz: from.z,
            tx: to.x,
            ty: to.y,
            tz: to.z,
        });
    }

    /** Casts a ray, and returns either the entity ID that got hit or undefined. */
    raycast(from: Vec3, to: Vec3) {
        return new Promise<RaycastInfo | undefined>((resolve) => {
            const id = this.#raycastIdCounter;
            this.#raycastIdCounter += 1;

            this.#raycastCallbacks.set(id, resolve);

            this.#worker.postMessage({
                type: 'raycast',
                id,
                fx: from.x,
                fy: from.y,
                fz: from.z,
                tx: to.x,
                ty: to.y,
                tz: to.z,
            });
        });
    }

    removeBody(body: Body) {
        const id = this.#bodyToId.get(body)!;

        this.#worker.postMessage({
            type: 'removeBody',
            id,
        });

        // TODO - recycle ID's, like in `graphics/graphics.ts`
        this.#bodyToId.delete(body);
        this.#idToBody.delete(id);
    }

    createTrimesh(opts: RigidBodyOptions, geometry: BufferGeometry) {
        const id = this.#idCounter;
        this.#idCounter += 1;

        // optimization: extract underlying buffer from the ThreeJS BufferAttribute
        // so that it can be moved to the worker thread, instead of copied.

        const nonIndexedGeo = geometry.index ? geometry.toNonIndexed() : geometry;
        const triangles = nonIndexedGeo.getAttribute('position').array as Float32Array;
        const triangleBuffer = triangles.buffer;

        this.#worker.postMessage({
            type: 'createTrimesh',
            triangleBuffer,
            x: opts.pos?.x ?? 0,
            y: opts.pos?.y ?? 0,
            z: opts.pos?.z ?? 0,
            sx: opts.scale?.x ?? 1,
            sy: opts.scale?.y ?? 1,
            sz: opts.scale?.z ?? 1,
            qx: opts.quat?.x ?? 0,
            qy: opts.quat?.y ?? 0,
            qz: opts.quat?.z ?? 0,
            qw: opts.quat?.w ?? 1,
            id,
        }, []);

        const mock = new Body();
        this.#idToBody.set(id, mock);
        this.#bodyToId.set(mock, id);

        return mock;
    }

    createSphere(opts: RigidBodyOptions, radius: number) {
        const id = this.#idCounter;
        this.#idCounter += 1;

        this.#worker.postMessage({
            type: 'createSphere',
            radius,
            mass: opts.mass,
            x: opts.pos?.x ?? 0,
            y: opts.pos?.y ?? 0,
            z: opts.pos?.z ?? 0,
            sx: opts.scale?.x ?? 1,
            sy: opts.scale?.y ?? 1,
            sz: opts.scale?.z ?? 1,
            qx: opts.quat?.x ?? 0,
            qy: opts.quat?.y ?? 0,
            qz: opts.quat?.z ?? 0,
            qw: opts.quat?.w ?? 1,
            fixedRotation: opts.fixedRotation ?? false,
            id,
        });

        const mock = new Body();
        this.#idToBody.set(id, mock);
        this.#bodyToId.set(mock, id);

        return mock;
    }

    createCapsule(opts: RigidBodyOptions, radius: number, height: number) {
        const id = this.#idCounter;
        this.#idCounter += 1;

        this.#worker.postMessage({
            type: 'createCapsule',
            radius,
            height,
            mass: opts.mass,
            x: opts.pos?.x ?? 0,
            y: opts.pos?.y ?? 0,
            z: opts.pos?.z ?? 0,
            sx: opts.scale?.x ?? 1,
            sy: opts.scale?.y ?? 1,
            sz: opts.scale?.z ?? 1,
            qx: opts.quat?.x ?? 0,
            qy: opts.quat?.y ?? 0,
            qz: opts.quat?.z ?? 0,
            qw: opts.quat?.w ?? 1,
            fixedRotation: opts.fixedRotation ?? false,
            id,
        });

        const mock = new Body();
        this.#idToBody.set(id, mock);
        this.#bodyToId.set(mock, id);

        return mock;
    }

    // ======================================
    // Utility methods for making RigidBodies (deprecated)
    // ======================================

    /** @deprecated */
    static makeCube(mass: number, size: number) {
        const shape = new Box(new Vec3(size, size, size));
        const body = new Body({ mass });
        body.addShape(shape);

        return body;
    }

    /** @deprecated */
    static makeBall(mass: number, radius: number) {
        const shape = new Sphere(radius);
        const body = new Body({ mass });
        body.addShape(shape);

        return body;
    }

    /** @deprecated */
    static makeCylinder(mass: number, radius: number, height: number) {
        const shape = new Cylinder(radius, radius, height);
        const body = new Body({ mass });
        body.addShape(shape);

        return body;
    }

    /** @deprecated */
    static makeCapsule(mass: number, radius: number, height: number) {
        const shape = new Sphere(radius);
        const body = new Body({ mass });
        body.addShape(shape, new Vec3(0, 0, 0));
        body.addShape(shape, new Vec3(0, height / 2 - radius, 0));
        body.addShape(shape, new Vec3(0, -height / 2 + radius, 0));

        return body;
    }
}
