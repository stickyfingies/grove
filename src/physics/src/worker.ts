import Ammo from './ammo/ammo';
import { start } from './ammoshell';
import { ForceRaycast, VelocityRaycast, Workload } from './header';

function log(message: any) {
    globalThis.postMessage({ type: 'log', message });
}

class Storage {
    constructor(
        public tbuffer: SharedArrayBuffer,
        public tview: Float32Array
    ) { }

    rigidBodies: Ammo.btRigidBody[] = [];
}


start(log).then(({
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
    raycast,
    getBodyPosition
}) => {
    let storage: Storage;

    globalThis.onmessage = ({ data }) => {
        const { type } = data;

        switch (type) {
            case 'init': {

                const { buffer } = data;
                storage = new Storage(buffer, new Float32Array(buffer));

                init(data);

                let last = performance.now();
                const mainLoop = () => {
                    const now = performance.now();
                    update(now - last);
                    // copy transforms
                    for (let i = 0; i < storage.rigidBodies.length; i++) {
                        const [x, y, z] = getBodyPosition(storage.rigidBodies[i]);
                        const offset = i * 3;
                        storage.tview[offset + 0] = x;
                        storage.tview[offset + 1] = y;
                        storage.tview[offset + 2] = z;
                    }
                    last = now;
                    // collisions get sent inside Bullet's internal mainloop
                    requestAnimationFrame(mainLoop);
                };

                mainLoop();
                break;
            }
            case 'workload': {
                const { forces, velocities, raycasts, force_raycasts, velocity_raycasts }: Workload<{ id: number }> = data.work;
                addForce(forces.map((force) => {
                    return { object: storage.rigidBodies[force.object.id], vector: force.vector };
                }));
                addVelocity(velocities.map((velocity) => {
                    return { object: storage.rigidBodies[velocity.object.id], vector: velocity.vector };
                }));
                raycast(raycasts);
                addForceConditionalRaycast(force_raycasts.map((force_raycast): ForceRaycast<Ammo.btRigidBody> => {
                    return {
                        force: {
                            object: storage.rigidBodies[force_raycast.force.object.id],
                            vector: force_raycast.force.vector
                        },
                        raycast: force_raycast.raycast
                    };
                }));
                addVelocityConditionalRaycast(velocity_raycasts.map((velocity_raycast): VelocityRaycast<Ammo.btRigidBody> => {
                    return {
                        velocity: {
                            object: storage.rigidBodies[velocity_raycast.velocity.object.id],
                            vector: velocity_raycast.velocity.vector
                        },
                        raycast: velocity_raycast.raycast
                    };
                }));
                break;
            }
            case 'removeBody': {
                const { id } = data;
                const body = storage.rigidBodies[id];
                removeBody(body);
                break;
            }
            case 'collisionTest': {
                collisionTest!(data);
                break;
            }
            case 'createPlane': {
                const { id } = data;
                const body = createPlane(data, data);
                body.setUserIndex(id);
                storage.rigidBodies[id] = body;
                break;
            }
            case 'createSphere': {
                const { id } = data;
                const body = createSphere(data, data, data);
                body.setUserIndex(id);
                storage.rigidBodies[id] = body;
                break;
            }
            case 'createCapsule': {
                const { id } = data;
                const body = createCapsule(data, data, data);
                body.setUserIndex(id);
                storage.rigidBodies[id] = body;
                break;
            }
            case 'createTrimesh': {
                const { id } = data;
                const body = createTrimesh(data, data, data.geometry);
                body.setUserIndex(id);
                storage.rigidBodies[id] = body;
                break;
            }
            default: {
                throw new Error(`${type} is not a valid command`);
            }
        }
    };

    // Tell the frontend that libraries are loaded and we're ready to roll
    globalThis.postMessage({ type: 'ready' });
});