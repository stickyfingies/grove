import { BufferGeometry } from 'three';
import {
    Body,
    Box,
    Cylinder,
    GSSolver,
    PointToPointConstraint,
    Quaternion,
    Ray,
    RaycastResult,
    SAPBroadphase,
    Sphere,
    SplitSolver,
    Vec3,
    World,
} from 'cannon-es';

import Engine from './engine';
import Entity from './ecs/entity';

export const PhysicsData = Body;
// eslint-disable-next-line no-redeclare
export type PhysicsData = Body;
export const ConstraintData = PointToPointConstraint;
// eslint-disable-next-line no-redeclare
export type ConstraintData = PointToPointConstraint;

export type RigidBodyOptions = {
    pos?: Vec3,
    scale?: Vec3,
    quat?: Quaternion,
    mass?: number,
    fixedRotation?: boolean
}

export class Physics {
    /** World container which holds all physical bodies */
    #world = new World();

    #bodyToEntity = new Map<Body, Entity>();

    #worker: Worker;

    #bodyId = 0;

    #tbuffer = new SharedArrayBuffer(4 * 16 * 1024);

    #tview = new Float32Array(this.#tbuffer);

    #idToBody = new Map<number, Body>();

    #bodyToId = new Map<Body, number>();

    async init(engine: Engine) {
        this.#worker = new Worker(new URL('./physicsworker.ts', import.meta.url));

        // Wait until ammo is loaded before telling the worker to init
        this.#worker.onmessage = ({ data }) => {
            switch (data.type) {
            case 'ready': {
                this.#worker.postMessage({ type: 'init', buffer: this.#tbuffer });
                break;
            }
            default: {
                throw new Error(`[physics] unknown message type ${data.type}`);
            }
            }
        };

        // general world options
        this.#world.gravity.set(0, -9.8, 0);
        this.#world.allowSleep = true;

        // default contact options (disabled friction for character controllers)
        this.#world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.#world.defaultContactMaterial.contactEquationRelaxation = 4;
        this.#world.defaultContactMaterial.friction = 0.0;

        // provide broadphase
        this.#world.broadphase = new SAPBroadphase(this.#world);
        this.#world.broadphase.useBoundingBoxes = true;

        // collision solver
        const split = true;
        const solver = new GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.#world.solver = split ? new SplitSolver(solver) : solver;

        // listen for entity events
        engine.ecs.events.on(`set${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
            // if `data.shapes.length` === 3, it's because it's a capsule
            // if the body has zero shapes, it's a mock for the new system - don't add to scene
            if (data.shapes.length) this.#world.addBody(data);
            this.#bodyToEntity.set(data, new Entity(Entity.defaultManager, id));
        });
        engine.ecs.events.on(`set${ConstraintData.name}Component`, (id: number, data: ConstraintData) => {
            this.#world.addConstraint(data);
        });
        engine.ecs.events.on(`delete${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
            this.#world.removeBody(data);
            this.#bodyToEntity.delete(data);
        });
        engine.ecs.events.on(`delete${ConstraintData.name}Component`, (id: number, data: ConstraintData) => {
            this.#world.removeConstraint(data);
        });
    }

    update(delta: number) {
        for (const [id, body] of this.#idToBody) {
            const offset = 3 * id;
            body.position.x = this.#tview[offset + 0];
            body.position.y = this.#tview[offset + 1];
            body.position.z = this.#tview[offset + 2];
        }
        this.#world.step(1 / 60, Math.min(delta, 1 / 30), 10);
    }

    getEntityFromBody(body: Body) {
        return this.#bodyToEntity.get(body);
    }

    addVelocity(body: Body, velocity: Vec3) {
        if (body.shapes.length === 0) {
            this.#worker.postMessage({
                type: 'addVelocity',
                id: this.#bodyToId.get(body),
                x: velocity.x,
                y: velocity.y,
                z: velocity.z,
            });
        } else {
            body.velocity.x += velocity.x;
            body.velocity.y += velocity.y;
            body.velocity.z += velocity.z;
        }
    }

    createConcave(opts: RigidBodyOptions, geometry: BufferGeometry) {
        const id = this.#bodyId;
        this.#bodyId += 1;

        const nonIndexedGeo = geometry.toNonIndexed();
        const triangles = nonIndexedGeo.getAttribute('position').array;

        this.#worker.postMessage({
            type: 'createConcave',
            triangles,
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
        });

        const mock = new Body();
        this.#idToBody.set(id, mock);
        this.#bodyToId.set(mock, id);

        return mock;
    }

    createSphere(opts: RigidBodyOptions, radius: number) {
        const id = this.#bodyId;
        this.#bodyId += 1;

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

    /**
     * Returns true if a body exists on the provided line.
     * @note only detects bodies in collisionFilterGroup 1
     */
    raycast(from: Vec3, to: Vec3) {
        const ray = new Ray(from, to);
        const result = new RaycastResult();

        ray.intersectWorld(this.#world, { result, collisionFilterMask: 1 });

        return result.hasHit;
    }

    // ======================================
    // Utility methods for making RigidBodies
    // ======================================

    static makeCube(mass: number, size: number) {
        const shape = new Box(new Vec3(size, size, size));
        const body = new Body({ mass });
        body.addShape(shape);

        return body;
    }

    static makeBall(mass: number, radius: number) {
        const shape = new Sphere(radius);
        const body = new Body({ mass });
        body.addShape(shape);

        return body;
    }

    static makeCylinder(mass: number, radius: number, height: number) {
        const shape = new Cylinder(radius, radius, height);
        const body = new Body({ mass });
        body.addShape(shape);

        return body;
    }

    static makeCapsule(mass: number, radius: number, height: number) {
        const shape = new Sphere(radius);
        const body = new Body({ mass });
        body.addShape(shape, new Vec3(0, 0, 0));
        body.addShape(shape, new Vec3(0, height / 2 - radius, 0));
        body.addShape(shape, new Vec3(0, -height / 2 + radius, 0));

        return body;
    }
}
