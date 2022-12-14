import { start } from './ammoshell';

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
        case 'addForce': {
            addForce(data);
            break;
        }
        case 'addForceConditionalRaycast': {
            addForceConditionalRaycast(data);
            break;
        }
        case 'addVelocity': {
            addVelocity(data);
            break;
        }
        case 'addVelocityConditionalRaycast': {
            addVelocityConditionalRaycast(data);
            break;
        }
        case 'raycast': {
            raycast(data);
            break;
        }
        default: {
            throw new Error(`${type} is not a valid command`);
        }
    }
};

// Tell the frontend that libraries are loaded and we're ready to roll
globalThis.postMessage({ type: 'ready' });
