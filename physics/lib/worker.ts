import { start } from './ammoshell';
import { Workload } from './header';

function log(message: any) {
    globalThis.postMessage({ type: 'log', message });
}

const {
    init,
    update,
    removeBody,
    collisionTest,
    createPlane,
    createSphere,
    createCapsule,
    createTrimesh,
    addForce,
    addForceConditionalRaycast,
    addVelocity,
    addVelocityConditionalRaycast,
    raycast
} = await start(log);

globalThis.onmessage = ({ data }) => {
    const { type } = data;

    switch (type) {
        case 'init': {
            init(data);

            let last = performance.now();
            const mainLoop = () => {
                const now = performance.now();
                update(now - last);
                last = now;
                // collisions get sent inside Bullet's internal mainloop
                requestAnimationFrame(mainLoop);
            };

            mainLoop();
            break;
        }
        case 'workload': {
            const { forces, velocities, raycasts, force_raycasts, velocity_raycasts }: Workload = data.work;
            addForce(forces);
            addVelocity(velocities);
            raycast(raycasts);
            addForceConditionalRaycast(force_raycasts);
            addVelocityConditionalRaycast(velocity_raycasts);
            break;
        }
        case 'removeBody': {
            removeBody(data);
            break;
        }
        case 'collisionTest': {
            collisionTest!(data);
            break;
        }
        case 'createPlane': {
            createPlane(data);
            break;
        }
        case 'createSphere': {
            createSphere(data);
            break;
        }
        case 'createCapsule': {
            createCapsule(data);
            break;
        }
        case 'createTrimesh': {
            createTrimesh(data);
            break;
        }
        default: {
            throw new Error(`${type} is not a valid command`);
        }
    }
};

// Tell the frontend that libraries are loaded and we're ready to roll
globalThis.postMessage({ type: 'ready' });
