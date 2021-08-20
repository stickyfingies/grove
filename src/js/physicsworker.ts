/* global Ammo */

import './ammo/ammotypes';

importScripts('./ammo.wasm.js');

Ammo().then(() => {
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
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));

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

                for (const [id, rb] of idToRb) {
                    const trans = new Ammo.btTransform();
                    rb.getMotionState().getWorldTransform(trans);

                    const offset = id * 3;
                    tview[offset + 0] = trans.getOrigin().x();
                    tview[offset + 1] = trans.getOrigin().y();
                    tview[offset + 2] = trans.getOrigin().z();
                }
            }, 1000 / 60);
            break;
        }
        case 'createSphere': {
            const {
                x, y, z, id,
            } = data;

            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            startTransform.setOrigin(new Ammo.btVector3(x, y, z));

            const mass = 1;

            const motionState = new Ammo.btDefaultMotionState(startTransform);
            const shape = new Ammo.btSphereShape(1);
            const localInertia = new Ammo.btVector3(0, 0, 0);

            shape.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const sphere = new Ammo.btRigidBody(rbInfo);
            dynamicsWorld.addRigidBody(sphere);

            idToRb.set(id, sphere);

            break;
        }
        case 'createConcave': {
            const {
                triangles, x, y, z, sx, sy, sz, qx, qy, qz, qw, id,
            } = data;

            const quat = new Ammo.btQuaternion(qx, qy, qz, qw);
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            startTransform.setOrigin(new Ammo.btVector3(x, y, z));
            startTransform.setRotation(quat);

            const motionState = new Ammo.btDefaultMotionState(startTransform);

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
            const shape = new Ammo.btBvhTriangleMeshShape(trimesh, true, true);

            const localInertia = new Ammo.btVector3(0, 0, 0);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia,
            );
            const concave = new Ammo.btRigidBody(rbInfo);
            dynamicsWorld.addRigidBody(concave);

            idToRb.set(id, concave);
            break;
        }
        default: {
            throw new Error(`[physics worker]: ${type} is not a valid command`);
        }
        }
    };
});
