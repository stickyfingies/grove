/* global Ammo */

import './ammo/ammotypes';

importScripts('./ammo.wasm.js');

Ammo().then(() => {
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

    let tbuffer: SharedArrayBuffer;
    let tview: Float32Array;

    /** Map of ID's to RigidBodies */
    const idToRb = new Map<number, Ammo.btRigidBody>();

    // communication
    globalThis.onmessage = ({ data }) => {
        const { type } = data;

        switch (type) {
        case 'init': {
            const { buffer } = data;

            tbuffer = buffer;
            tview = new Float32Array(tbuffer);

            const persistentCollisions = new Map<number, Set<number>>();

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

                const newCollisions = [];

                // add to persistent collisions if not already (detects new collisions)
                for (const [first, second] of frameCollisions) {
                    if (!persistentCollisions.has(first)) {
                        persistentCollisions.set(first, new Set());
                    }

                    for (const bruh of second) {
                        if (!persistentCollisions.get(first)?.has(bruh)) {
                            // 'collisionStarted' event between `first` and `bruh`
                            newCollisions.push(first, bruh);
                            newCollisions.push(bruh, first);
                            persistentCollisions.get(first)?.add(bruh);
                        }
                    }
                }

                globalThis.postMessage({
                    type: 'collisions',
                    collisions: newCollisions,
                });

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

            // NOTE: This requires a special build of Ammo.js.  I got it from PlayCanvas, but
            // building it yourself is the reccomended route (i think).
            // @ts-ignore - Have to add `addFunction` to types definition file
            const checkForCollisionsPointer = Ammo.addFunction(checkForCollisions, 'vif');
            dynamicsWorld.setInternalTickCallback(checkForCollisionsPointer);

            const transform = new Ammo.btTransform();

            const simulate = (dt: number) => {
                // console.log(dt);
                dynamicsWorld.stepSimulation(dt);
                for (const [id, rb] of idToRb) {
                    rb.getMotionState().getWorldTransform(transform);

                    const offset = id * 3;
                    tview[offset + 0] = transform.getOrigin().x();
                    tview[offset + 1] = transform.getOrigin().y();
                    tview[offset + 2] = transform.getOrigin().z();
                }
            };

            let last = performance.now();
            const mainLoop = () => {
                const now = performance.now();
                simulate(now - last);
                last = now;

                // globalThis.postMessage({
                //     type: 'collisions',
                //     collisions,
                // });

                requestAnimationFrame(mainLoop);
            };

            mainLoop();

            break;
        }
        case 'removeBody': {
            const { id } = data;
            const body = idToRb.get(id)!;
            dynamicsWorld.removeRigidBody(body);
            // TODO - free memory (see `create_XXX_` methods)
            idToRb.delete(id);
            break;
        }
        case 'createSphere': {
            const {
                mass, fixedRotation, radius, x, y, z, sx, sy, sz, qx, qy, qz, qw, id,
            } = data;

            const origin = new Ammo.btVector3(x, y, z);
            const quat = new Ammo.btQuaternion(qx, qy, qz, qw);
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            startTransform.setOrigin(new Ammo.btVector3(x, y, z));
            startTransform.setRotation(quat);
            const motionState = new Ammo.btDefaultMotionState(startTransform);
            Ammo.destroy(startTransform);
            Ammo.destroy(quat);
            Ammo.destroy(origin);

            const shape = new Ammo.btSphereShape(radius);
            const localScale = new Ammo.btVector3(sx, sy, sz);
            shape.setLocalScaling(localScale);
            Ammo.destroy(localScale);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            shape.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const body = new Ammo.btRigidBody(rbInfo);
            Ammo.destroy(rbInfo);
            Ammo.destroy(localInertia);

            if (fixedRotation) {
                const angularFactor = new Ammo.btVector3(0, 0, 0);
                body.setAngularFactor(angularFactor);
                Ammo.destroy(angularFactor);
            }

            dynamicsWorld.addRigidBody(body);
            body.setUserIndex(id);
            idToRb.set(id, body);

            // Memory left to be freed: RigidBody, shapes, motionState

            break;
        }
        case 'createCapsule': {
            const {
                mass, fixedRotation, radius, height, x, y, z, sx, sy, sz, qx, qy, qz, qw, id,
            } = data;

            const origin = new Ammo.btVector3(x, y, z);
            const quat = new Ammo.btQuaternion(qx, qy, qz, qw);
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            startTransform.setOrigin(new Ammo.btVector3(x, y, z));
            startTransform.setRotation(quat);
            const motionState = new Ammo.btDefaultMotionState(startTransform);
            Ammo.destroy(startTransform);
            Ammo.destroy(quat);
            Ammo.destroy(origin);

            const shape = new Ammo.btCapsuleShape(radius, height);
            const localScale = new Ammo.btVector3(sx, sy, sz);
            shape.setLocalScaling(localScale);
            Ammo.destroy(localScale);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            shape.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const body = new Ammo.btRigidBody(rbInfo);
            Ammo.destroy(rbInfo);
            Ammo.destroy(localInertia);

            if (fixedRotation) {
                const angularFactor = new Ammo.btVector3(0, 0, 0);
                body.setAngularFactor(angularFactor);
                Ammo.destroy(angularFactor);
            }

            dynamicsWorld.addRigidBody(body);
            body.setUserIndex(id);
            idToRb.set(id, body);

            // Memory left to be freed: RigidBody, shapes, motionState

            break;
        }
        case 'createTrimesh': {
            const {
                triangleBuffer, x, y, z, sx, sy, sz, qx, qy, qz, qw, id,
            } = data;

            const origin = new Ammo.btVector3(x, y, z);
            const quat = new Ammo.btQuaternion(qx, qy, qz, qw);
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            startTransform.setOrigin(new Ammo.btVector3(x, y, z));
            startTransform.setRotation(quat);
            const motionState = new Ammo.btDefaultMotionState(startTransform);
            Ammo.destroy(startTransform);
            Ammo.destroy(quat);
            Ammo.destroy(origin);

            const mass = 0;

            const trimesh = new Ammo.btTriangleMesh();
            // const hull = new Ammo.btConvexHullShape();

            const triangles = new Float32Array(triangleBuffer);
            for (let i = 0; i < triangles.length; i += 9) {
                const v0 = new Ammo.btVector3(triangles[i + 0], triangles[i + 1], triangles[i + 2]);
                // hull.addPoint(v0, true);
                const v1 = new Ammo.btVector3(triangles[i + 3], triangles[i + 4], triangles[i + 5]);
                // hull.addPoint(v1, true);
                const v2 = new Ammo.btVector3(triangles[i + 6], triangles[i + 7], triangles[i + 8]);
                // hull.addPoint(v2, true);
                trimesh.addTriangle(v0, v1, v2, false);
            }

            const shape = new Ammo.btBvhTriangleMeshShape(trimesh, true, true);
            const localScale = new Ammo.btVector3(sx, sy, sz);
            shape.setLocalScaling(localScale);
            Ammo.destroy(localScale);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            // don't calculate inertia; object has zero mass

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const body = new Ammo.btRigidBody(rbInfo);
            Ammo.destroy(rbInfo);
            Ammo.destroy(localInertia);

            dynamicsWorld.addRigidBody(body);
            body.setUserIndex(id);
            idToRb.set(id, body);

            // Memory left to be freed: RigidBody, shapes, motionState

            break;
        }
        case 'addForce': {
            const {
                id, x, y, z,
            } = data;

            const body = idToRb.get(id)!;
            body.activate(true);

            const force = new Ammo.btVector3(x, y, z);
            body.applyCentralImpulse(force);
            Ammo.destroy(force);

            break;
        }
        case 'addForceConditionalRaycast': {
            const {
                id, x, y, z, fx, fy, fz, tx, ty, tz,
            } = data;

            const src = new Ammo.btVector3(fx, fy, fz);
            const dst = new Ammo.btVector3(tx, ty, tz);
            const res = new Ammo.ClosestRayResultCallback(src, dst);
            dynamicsWorld.rayTest(src, dst, res);
            Ammo.destroy(dst);
            Ammo.destroy(src);

            if (!res.hasHit()) return;
            Ammo.destroy(res);

            const body = idToRb.get(id)!;
            body.activate(true);

            const force = new Ammo.btVector3(x, y, z);
            body.applyCentralImpulse(force);
            Ammo.destroy(force);

            break;
        }
        case 'addVelocity': {
            const {
                id, x, y, z,
            } = data;

            const body = idToRb.get(id)!;
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

            break;
        }
        case 'addVelocityConditionalRaycast': {
            const {
                id, vx, vy, vz, fx, fy, fz, tx, ty, tz,
            } = data;

            const src = new Ammo.btVector3(fx, fy, fz);
            const dst = new Ammo.btVector3(tx, ty, tz);
            const res = new Ammo.ClosestRayResultCallback(src, dst);
            dynamicsWorld.rayTest(src, dst, res);
            Ammo.destroy(dst);
            Ammo.destroy(src);

            if (!res.hasHit()) return;
            Ammo.destroy(res);

            const body = idToRb.get(id)!;
            body.activate(true);

            const velocity = body.getLinearVelocity();
            const newVelocity = new Ammo.btVector3(
                velocity.x() + vx,
                velocity.y() + vy,
                velocity.z() + vz,
            );
            body.setLinearVelocity(newVelocity);
            Ammo.destroy(newVelocity);

            break;
        }
        case 'raycast': {
            const {
                id, fx, fy, fz, tx, ty, tz,
            } = data;

            const src = new Ammo.btVector3(fx, fy, fz);
            const dst = new Ammo.btVector3(tx, ty, tz);
            const res = new Ammo.ClosestRayResultCallback(src, dst);
            dynamicsWorld.rayTest(src, dst, res);
            Ammo.destroy(dst);
            Ammo.destroy(src);

            if (!res.hasHit()) {
                postMessage({ type: 'raycastResult', raycastId: id, bodyId: -1 });
                return;
            }

            const body = Ammo.btRigidBody.prototype.upcast(res.get_m_collisionObject());
            const hitPoint = res.get_m_hitPointWorld();
            postMessage({
                type: 'raycastResult',
                raycastId: id,
                bodyId: body.getUserIndex(),
                hitPoint: {
                    x: hitPoint.x(),
                    y: hitPoint.y(),
                    z: hitPoint.z(),
                },
            });
            break;
        }
        default: {
            throw new Error(`[physics worker]: ${type} is not a valid command`);
        }
        }
    };

    // Tell the frontend that libraries are loaded and we're ready to roll
    globalThis.postMessage({ type: 'ready' });
});
