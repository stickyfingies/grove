/* global Ammo */

// Ammo.js typings
import './ammo/armadillo';

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

    // ground
    (() => {
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, -56, 0));

        const mass = 0;

        const motionState = new Ammo.btDefaultMotionState(transform);
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50));
        const localInertia = new Ammo.btVector3(0, 0, 0);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const ground = new Ammo.btRigidBody(rbInfo);
        dynamicsWorld.addRigidBody(ground);
    })();

    let sphere: Ammo.btRigidBody;

    // a ball
    (() => {
        const startTransform = new Ammo.btTransform();
        startTransform.setIdentity();
        startTransform.setOrigin(new Ammo.btVector3(2, 10, 0));

        const mass = 1;

        const motionState = new Ammo.btDefaultMotionState(startTransform);
        const shape = new Ammo.btSphereShape(1);
        const localInertia = new Ammo.btVector3(0, 0, 0);

        shape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        sphere = new Ammo.btRigidBody(rbInfo);
        dynamicsWorld.addRigidBody(sphere);
    })();

    // loop: step simulation
    setInterval(() => {
        dynamicsWorld.stepSimulation(1 / 60);

        const trans = new Ammo.btTransform();
        sphere.getMotionState().getWorldTransform(trans);
        console.log(`world pos = ${[trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]}`);
    }, 1000 / 60);

    let tbuffer: SharedArrayBuffer;
    let tview: Float32Array;

    // communication
    globalThis.onmessage = ({ data }) => {
        const { type } = data;

        switch (type) {
        case 'init': {
            const { buffer } = data;
            tbuffer = buffer;
            tview = new Float32Array(tbuffer);
            break;
        }
        case 'addbox': {
            // add a box to the scene, or something idk
            break;
        }
        default: {
            throw new Error(`[physics worker]: ${type} is not a valid command`);
        }
        }
    };
});
