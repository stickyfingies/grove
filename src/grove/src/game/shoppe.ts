import { CameraData, CAMERA_TAG } from '@grove/graphics';
import { PhysicsData, RigidBodyDescription } from "@grove/physics";
import { Mesh, MeshBasicMaterial, SphereBufferGeometry, Vector3 } from "three";
import { graphics, physics, world } from "@grove/engine";
import { addToInventory } from "./inventory";
import { player } from "./player";
import { Score } from "./score";
import { SphereShape } from '@grove/engine/lib/load';

// data (mostly json)
const shoppe = world.createEntity();
const rigidBodyDescription: RigidBodyDescription = {
    mass: 0,
    isGhost: false,
    shouldRotate: true
};
const sphereShape: SphereShape = { radius: 1 };

// pipeline
const mesh = new Mesh(new SphereBufferGeometry(sphereShape.radius), new MeshBasicMaterial({ color: 0x0000ff }));
graphics.addObjectToScene(mesh);
const body = physics.createSphere(rigidBodyDescription, {
    pos: [0, 20, 20],
    scale: [1, 1, 1],
    quat: [0, 0, 0, 1]
}, sphereShape);
world.setComponent(shoppe, [Mesh, PhysicsData], [mesh, body]);

// 'e' to interact
document.addEventListener('keydown', async (e) => {
    if (e.key === "e") {
        const [camera] = world.getComponent(world.getTag(CAMERA_TAG), [CameraData]);
        const direction = camera.getWorldDirection(new Vector3()).multiplyScalar(30);
        const final_point = camera.position.clone().add(direction);
        const raycastInfo = await physics.raycast(camera.position.toArray(), final_point.toArray());

        // can you reject a promise without sending an error?
        if (raycastInfo) {
            const { entityID } = raycastInfo;
            if (entityID === shoppe) {
                const [score] = world.getComponent(player, [Score]);
                const ITEM_PRICE = 5;

                if (score.score >= ITEM_PRICE) {
                    score.score -= ITEM_PRICE;
                    addToInventory({ name: 'Fire Sword', damage: 9, ranged: true }, true);
                }
                else console.log(`Not enough points.  Need: ${ITEM_PRICE}`);
            }
        }
    }
});
