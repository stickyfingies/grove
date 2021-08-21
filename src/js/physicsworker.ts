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

    const idToRb = new Map<number, Ammo.btRigidBody>();

    // communication
    globalThis.onmessage = ({ data }) => {
        const { type } = data;

        switch (type) {
        case 'init': {
            const { buffer } = data;
            tbuffer = buffer;
            tview = new Float32Array(tbuffer);

            // loop: step simulation
            setInterval(() => {
                dynamicsWorld.stepSimulation(1 / 60);

                const trans = new Ammo.btTransform();
                for (const [id, rb] of idToRb) {
                    rb.getMotionState().getWorldTransform(trans);

                    const offset = id * 3;
                    tview[offset + 0] = trans.getOrigin().x();
                    tview[offset + 1] = trans.getOrigin().y();
                    tview[offset + 2] = trans.getOrigin().z();
                }
                Ammo.destroy(trans);
            }, 1000 / 60);
            break;
        }
        case 'createSphere': {
            console.log('[physics worker] createSphere');
            const {
                mass, radius, x, y, z, id,
            } = data;

            const origin = new Ammo.btVector3(x, y, z);
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            startTransform.setOrigin(origin);
            const motionState = new Ammo.btDefaultMotionState(startTransform);
            Ammo.destroy(startTransform);
            Ammo.destroy(origin);

            const shape = new Ammo.btSphereShape(radius);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            shape.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const sphere = new Ammo.btRigidBody(rbInfo);
            Ammo.destroy(rbInfo);
            Ammo.destroy(localInertia);

            dynamicsWorld.addRigidBody(sphere);
            idToRb.set(id, sphere);

            // Memory left to be freed: RigidBody, shapes, motionState

            break;
        }
        case 'createConcave': {
            const {
                triangles, x, y, z, sx, sy, sz, qx, qy, qz, qw, id,
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
            for (let i = 0; i < triangles.length; i += 9) {
                const v0 = new Ammo.btVector3(triangles[i + 0], triangles[i + 1], triangles[i + 2]);
                const v1 = new Ammo.btVector3(triangles[i + 3], triangles[i + 4], triangles[i + 5]);
                const v2 = new Ammo.btVector3(triangles[i + 6], triangles[i + 7], triangles[i + 8]);
                trimesh.addTriangle(v0, v1, v2, false);
            }

            const localScale = new Ammo.btVector3(sx, sy, sz);
            trimesh.setScaling(localScale);
            Ammo.destroy(localScale);

            const shape = new Ammo.btBvhTriangleMeshShape(trimesh, true, true);

            const localInertia = new Ammo.btVector3(0, 0, 0);
            // don't calculate inertia; object has zero mass

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const concave = new Ammo.btRigidBody(rbInfo);
            Ammo.destroy(rbInfo);
            Ammo.destroy(localInertia);

            dynamicsWorld.addRigidBody(concave);
            idToRb.set(id, concave);

            // Memory left to be freed: RigidBody, shapes, motionState

            break;
        }
        default: {
            throw new Error(`[physics worker]: ${type} is not a valid command`);
        }
        }
    };

    // Send an empty message so the physics frontend knows Ammo is loaded
    // TODO - this still fucks up, so move `globalThis.onMessage` to the outside of `Ammo().then()`
    // @ts-ignore - Triggers some bullshit argument count error
    globalThis.postMessage({ type: 'ready' });
});
