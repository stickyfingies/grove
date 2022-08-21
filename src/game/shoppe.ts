import { CameraData, CAMERA_TAG, MeshData } from "3-AD";
import { PhysicsData } from "firearm";
import { Mesh, MeshBasicMaterial, SphereBufferGeometry, Vector3 } from "three";
import { graphics, physics, world } from "../engine";
import { addToInventory } from "./inventory";
import { player } from "./player";
import { ScoreData } from "./score";

const shoppe = world.createEntity();

// create the 3D model
const mesh = new Mesh(new SphereBufferGeometry(1), new MeshBasicMaterial({ color: 0x0000ff }));
graphics.addObjectToScene(mesh);
world.setComponent(shoppe, MeshData, mesh);

// create the Higgs field
const body = physics.createSphere({ mass: 0, pos: [0, 20, 20], radius: 1 });
world.setComponent(shoppe, PhysicsData, body);

// 'e' to interact
document.addEventListener('keydown', async (e) => {
    if (e.key === "e") {
        const camera = world.getComponent(world.getTag(CAMERA_TAG), CameraData);
        const direction = camera.getWorldDirection(new Vector3()).multiplyScalar(30);
        const final_point = camera.position.clone().add(direction);
        const raycastInfo = await physics.raycast(camera.position.toArray(), final_point.toArray());

        // can you reject a promise without sending an error?
        if (raycastInfo) {
            const { entityID } = raycastInfo;
            if (entityID === shoppe) {
                const score = player.getComponent(ScoreData);
                const ITEM_PRICE = 5;

                if (score.score > ITEM_PRICE) {
                    score.score -= ITEM_PRICE;
                    addToInventory({ name: 'Fire Sword', damage: 9, ranged: true }, true);
                }
                else console.log(`Not enough points.  Need: ${ITEM_PRICE}`);
            }
        }
    }
});