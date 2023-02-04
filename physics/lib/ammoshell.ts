import Ammo from './ammo/ammo';
import { PhysicsEngine, Force, Velocity, Raycast, VelocityRaycast, ForceRaycast, Vec3, Quat, Transform, RigidBodyDescription, SphereShapeDescription, CapsuleShapeDescription, TriangleMeshShapeDescription, CollisionCallback } from './header';

type GenericShape =
    | Ammo.btBoxShape
    | Ammo.btSphereShape
    | Ammo.btCapsuleShape
    | Ammo.btStaticPlaneShape
    | Ammo.btBvhTriangleMeshShape;

type _Ammo = typeof Ammo;

function scaleShape(Ammo: _Ammo, shape: GenericShape, scale: Vec3) {
    const localScale = new Ammo.btVector3(...scale);
    shape.setLocalScaling(localScale);
    Ammo.destroy(localScale);
}

function createMotionState(Ammo: _Ammo, pos: Vec3, quaternion: Quat) {
    const origin = new Ammo.btVector3(...pos);
    const quat = new Ammo.btQuaternion(...quaternion);
    const startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(origin);
    startTransform.setRotation(quat);
    const motionState = new Ammo.btDefaultMotionState(startTransform);

    Ammo.destroy(startTransform);
    Ammo.destroy(quat);
    Ammo.destroy(origin);

    return motionState;
}

function createRigidBody(Ammo: _Ammo, shape: GenericShape, mass: number, motionState: Ammo.btMotionState) {
    const localInertia = new Ammo.btVector3(0, 0, 0);
    if (mass > 0) shape.calculateLocalInertia(mass, localInertia);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        shape,
        localInertia,
    );
    const body = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);
    Ammo.destroy(localInertia);

    return body;
}

function setupRigidBody(Ammo: _Ammo, shape: GenericShape, transform: Transform, description: RigidBodyDescription) {
    const { pos, scale, quat } = transform;
    const {
        mass,
        isGhost,
        shouldRotate
    } = description;

    const motionState = createMotionState(Ammo, pos, quat);
    scaleShape(Ammo, shape, scale);
    const body = createRigidBody(Ammo, shape, mass, motionState);

    if (isGhost) body.setCollisionFlags(4);
    if (!shouldRotate) {
        const angularFactor = new Ammo.btVector3(0, 0, 0);
        body.setAngularFactor(angularFactor);
        Ammo.destroy(angularFactor);
    }

    return body;
}

const __Ammo = Ammo;
export async function start(log: (msg: any) => void): Promise<PhysicsEngine<Ammo.btRigidBody>> {
    const Ammo = await __Ammo();
    log(import.meta.url);

    // I don't plan on freeing any of this memory, since these objects will
    // exist until the program's done executing so V8 will clear the memory
    // for me then anyway.
    const collisionConfig = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfig,
    );

    const gravity = new Ammo.btVector3(0, -9.8, 0);
    dynamicsWorld.setGravity(gravity);
    Ammo.destroy(gravity);

    const persistentCollisions = new Map<number, Set<number>>();

    let newCollisions: number[] = [];

    const collisionCallbacks = new Map<number, CollisionCallback>();

    const checkForCollisions = () => {
        const frameCollisions = new Map<number, Set<number>>();

        const manifoldCount = dispatcher.getNumManifolds();
        for (let i = 0; i < manifoldCount; i++) {
            const manifold = dispatcher.getManifoldByIndexInternal(i);

            const contactCount = manifold.getNumContacts();
            if (contactCount !== 0) {
                const id0 = manifold.getBody0().getUserIndex();
                const id1 = manifold.getBody1().getUserIndex();
                // set new collisions
                if (!frameCollisions.has(id0)) {
                    frameCollisions.set(id0, new Set());
                }
                frameCollisions.get(id0)!.add(id1);
            }
        }

        // add to persistent collisions if not already (detects new collisions)
        // 'second' is a set of IDs colliding with `first`
        for (const [first, second] of frameCollisions) {
            if (!persistentCollisions.has(first)) {
                persistentCollisions.set(first, new Set());
            }
            // `bruh` is each ID in the set of ID's colliding with `first`
            for (const bruh of second) {
                if (!persistentCollisions.get(first)?.has(bruh)) {
                    // 'collisionStarted' event between `first` and `bruh`
                    newCollisions.push(first, bruh);
                    newCollisions.push(bruh, first);

                    persistentCollisions.get(first)?.add(bruh);
                }
            }
        }

        // remove from persistent collisions if not colliding this frame
        for (const [first, second] of persistentCollisions) {
            for (const bruh of second) {
                if (!frameCollisions.get(first)?.has(bruh)) {
                    // collisionStopped' event between `first` and `bruh`
                    persistentCollisions.get(first)?.delete(bruh);
                }
            }
        }
    };

    const init = () => {
        // NOTE: This requires a special build of Ammo.js.  I got it from PlayCanvas, but
        // building it yourself is the reccomended route (i think).
        // @ts-ignore - Have to add `addFunction` to types definition file
        const checkForCollisionsPointer = Ammo.addFunction(checkForCollisions, 'vif');
        dynamicsWorld.setInternalTickCallback(checkForCollisionsPointer);
    }

    const update = (dt: number) => {
        // for (const [id0, id1] of followRelationships) {
        //     const transform1 = new Ammo.btTransform(); // transform of target object
        //     const rb0 = storage.rigidBodies[id0];
        //     const rb1 = storage.rigidBodies[id1];
        //     rb1.getMotionState().getWorldTransform(transform1);
        //     rb0.getMotionState().setWorldTransform(transform1);
        //     rb0.setCenterOfMassTransform(transform1);
        // }
        dynamicsWorld.stepSimulation(dt);
        for (let i = 0; i < newCollisions.length; i += 2) {
            const rbId0 = newCollisions[i + 0];
            const rbId1 = newCollisions[i + 1];
            collisionCallbacks.get(rbId0)?.(rbId1);
        }
        newCollisions = [];
    }

    const removeBody = (body: Ammo.btRigidBody) => {
        dynamicsWorld.removeRigidBody(body);
        // TODO - free memory (see `create_XXX_` methods)
    }

    const _collisionTest = () => {

        const cbContactResult = new Ammo.ConcreteContactResultCallback();

        cbContactResult.addSingleResult = (cp, colObj0Wrap, _partId0, _index0, colObj1Wrap, _partId1, _index1) => {

            let contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);

            const distance = contactPoint.getDistance();

            if (distance > 0) return 0;

            const colWrapper0 = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper);
            const rb0 = Ammo.castObject(colWrapper0.getCollisionObject(), Ammo.btRigidBody);

            const colWrapper1 = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper);
            const rb1 = Ammo.castObject(colWrapper1.getCollisionObject(), Ammo.btRigidBody);

            const id0 = rb0.getUserIndex();
            const id1 = rb1.getUserIndex();

            const localPos = contactPoint.get_m_localPointA();
            const worldPos = contactPoint.get_m_positionWorldOnA();

            const localPosDisplay = { x: localPos.x(), y: localPos.y(), z: localPos.z() };
            const worldPosDisplay = { x: worldPos.x(), y: worldPos.y(), z: worldPos.z() };

            postMessage({
                type: 'collisionTestResult',
                id0,
                id1,
                localPos: localPosDisplay,
                worldPos: worldPosDisplay
            });

            return 0;
        }
    }

    const createPlane = (rbdesc: RigidBodyDescription, transform: Transform): Ammo.btRigidBody => {
        // shape
        const planeNormal = new Ammo.btVector3(0, 1, 0);
        const shape = new Ammo.btStaticPlaneShape(planeNormal, 1);
        Ammo.destroy(planeNormal);

        const body = setupRigidBody(Ammo, shape, transform, rbdesc);

        dynamicsWorld.addRigidBody(body);

        // ! Memory left to be freed: RigidBody, shapes, motionState

        return body;
    }

    const createSphere = (rbdesc: RigidBodyDescription, t: Transform, s: SphereShapeDescription) => {
        const shape = new Ammo.btSphereShape(s.radius);
        const body = setupRigidBody(Ammo, shape, t, rbdesc);

        dynamicsWorld.addRigidBody(body);
        // console.log(rigidBodies);

        // if (objectToFollow >= 0) followRelationships.set(id, objectToFollow);

        // ! Memory left to be freed: RigidBody, shapes, motionState

        return body;
    }

    const createCapsule = (rbdesc: RigidBodyDescription, t: Transform, s: CapsuleShapeDescription) => {
        const shape = new Ammo.btCapsuleShape(s.radius, s.height);
        const body = setupRigidBody(Ammo, shape, t, rbdesc);

        dynamicsWorld.addRigidBody(body);
        // console.log(rigidBodies);

        // ! Memory left to be freed: RigidBody, shapes, motionState

        return body;
    }

    const createTrimesh = (rbdesc: RigidBodyDescription, t: Transform, s: TriangleMeshShapeDescription) => {
        const trimesh = new Ammo.btTriangleMesh();
        // const hull = new Ammo.btConvexHullShape();

        const triangles = new Float32Array(s);
        for (let i = 0; i < triangles.length; i += 9) {
            const v0 = new Ammo.btVector3(triangles[i + 0], triangles[i + 1], triangles[i + 2]);
            // hull.addPoint(v0, true);
            const v1 = new Ammo.btVector3(triangles[i + 3], triangles[i + 4], triangles[i + 5]);
            // hull.addPoint(v1, true);
            const v2 = new Ammo.btVector3(triangles[i + 6], triangles[i + 7], triangles[i + 8]);
            // hull.addPoint(v2, true);
            trimesh.addTriangle(v0, v1, v2, true);
        }

        const shape = new Ammo.btBvhTriangleMeshShape(trimesh, true, true);

        const body = setupRigidBody(Ammo, shape, t, rbdesc);

        dynamicsWorld.addRigidBody(body);
        // console.log(rigidBodies);

        // ! Memory left to be freed: RigidBody, shapes, motionState

        return body;
    }

    const addForce = (f: Force<Ammo.btRigidBody>) => {
        const { object, vector: [x, y, z] } = f;
        object.activate(true);
        const force = new Ammo.btVector3(x, y, z);
        object.applyCentralImpulse(force);
        Ammo.destroy(force);
    }

    const addForceConditionalRaycast = (f: ForceRaycast<Ammo.btRigidBody>) => {
        const { force, raycast } = f;
        const src = new Ammo.btVector3(...raycast.from);
        const dst = new Ammo.btVector3(...raycast.to);
        const res = new Ammo.ClosestRayResultCallback(src, dst);
        dynamicsWorld.rayTest(src, dst, res);
        Ammo.destroy(dst);
        Ammo.destroy(src);

        if (!res.hasHit()) return;
        Ammo.destroy(res);

        const body = force.object;
        body.activate(true);

        const btForce = new Ammo.btVector3(...force.vector);
        body.applyCentralImpulse(btForce);
        Ammo.destroy(btForce);
    }

    const addVelocity = (v: Velocity<Ammo.btRigidBody>) => {
        const { object, vector: [x, y, z] } = v;
        const body = object;
        body.activate(true);

        // Note that this will also clamp the body's velocity to the velocity you're adding.
        // If you don't like it, talk to the character controller author!

        const { max, min } = Math;
        const clamp = (n: number, a: number, b: number) => max(min(n, max(a, b)), min(a, b));

        const velocity = body.getLinearVelocity();
        const newVelocity = new Ammo.btVector3(
            velocity.x() + x,
            velocity.y() + y,
            velocity.z() + z,
        );
        newVelocity.setX(clamp(newVelocity.x(), -x, x));
        newVelocity.setZ(clamp(newVelocity.z(), -z, z));
        body.setLinearVelocity(newVelocity);
        Ammo.destroy(newVelocity);
    }

    const addVelocityConditionalRaycast = (v: VelocityRaycast<Ammo.btRigidBody>) => {
        const { velocity, raycast } = v;

        const src = new Ammo.btVector3(...raycast.from);
        const dst = new Ammo.btVector3(...raycast.to);
        const res = new Ammo.ClosestRayResultCallback(src, dst);
        dynamicsWorld.rayTest(src, dst, res);
        Ammo.destroy(dst);
        Ammo.destroy(src);

        if (!res.hasHit()) return;
        Ammo.destroy(res);

        const body = velocity.object;
        body.activate(true);

        const currentVelocity = body.getLinearVelocity();
        const newVelocity = new Ammo.btVector3(
            currentVelocity.x() + velocity.vector[0],
            currentVelocity.y() + velocity.vector[1],
            currentVelocity.z() + velocity.vector[2],
        );
        body.setLinearVelocity(newVelocity);
        Ammo.destroy(newVelocity);
    }

    const raycast = (r: Raycast) => {
        const { id, from: [fx, fy, fz], to: [tx, ty, tz] } = r;
        const src = new Ammo.btVector3(fx, fy, fz);
        const dst = new Ammo.btVector3(tx, ty, tz);
        // there's different kinds of callbakcs you can use
        const res = new Ammo.ClosestRayResultCallback(src, dst);
        dynamicsWorld.rayTest(src, dst, res);
        Ammo.destroy(dst);
        Ammo.destroy(src);

        if (!res.hasHit()) {
            return { raycastId: id, bodyId: -1 };
        }

        const body = Ammo.btRigidBody.prototype.upcast(res.get_m_collisionObject());
        const hitPoint = res.get_m_hitPointWorld();
        return {
            raycastId: id,
            bodyId: body.getUserIndex(),
            hitPoint: {
                x: hitPoint.x(),
                y: hitPoint.y(),
                z: hitPoint.z(),
            },
        };
    }

    const getBodyPosition = (body: Ammo.btRigidBody): Vec3 => {
        const matrix = new Ammo.btTransform();
        body.getMotionState().getWorldTransform(matrix);
        const origin = matrix.getOrigin();
        const x = origin.x();
        const y = origin.y();
        const z = origin.z();
        Ammo.destroy(matrix);
        return [x, y, z];
    }

    const registerCollisionCallback = (body: Ammo.btRigidBody, cb: CollisionCallback) => {
        console.log(body.getUserIndex());
        collisionCallbacks.set(body.getUserIndex(), cb as CollisionCallback);
    }

    const removeCollisionCallback = (body: Ammo.btRigidBody) => {
        collisionCallbacks.delete(body.getUserIndex());
    }

    return {
        init,
        update,
        removeBody,
        registerCollisionCallback,
        removeCollisionCallback,
        createPlane,
        createSphere,
        createCapsule,
        createTrimesh,
        addForce,
        addForceConditionalRaycast,
        addVelocity,
        addVelocityConditionalRaycast,
        raycast,
        getBodyPosition
    }
}