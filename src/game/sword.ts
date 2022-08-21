import { Vector3 } from 'three';
import anime from 'animejs';

import Entity from '../ecs/entity';
import { CAMERA_TAG, CameraData, MeshData } from '3-AD';
import { dealDamage } from './damage.system';
import { assetLoader, graphics, physics, world } from '../engine';
import { getEquippedItem } from './inventory';

const DELAY_BETWEEN_SWINGS = 1000; // milliseconds
const SWING_DISTANCE = 3; // meters
const DAMAGE = 10; // ???

const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);

export const sword = new Entity();

assetLoader.loadModel('./models/sword-glb/sword.glb')
    .then((mesh) => {
        mesh.parent = camera;
        mesh.scale.set(0.1, 0.1, 0.1);
        mesh.position.set(0.5, -0.7, -1.3);
        graphics.addObjectToScene(mesh);
        sword.setComponent(MeshData, mesh);
    });

let lastSwung = 0;

document.addEventListener('mousedown', async (e) => {
    if (e.button !== 0) return;

    if (performance.now() - lastSwung < DELAY_BETWEEN_SWINGS) return;

    lastSwung = performance.now();

    // 0.5 second upswing and downswing
    anime({
        targets: sword.getComponent(MeshData).rotation,
        keyframes: [
            { x: -Math.PI / 2 },
            { x: 0 },
        ],
        duration: DELAY_BETWEEN_SWINGS,
        easing: 'easeInQuart',
    });

    // 1) Raycast forwards from camera
    const direction = camera.getWorldDirection(new Vector3()).multiplyScalar(SWING_DISTANCE);
    const endpoint = camera.position.clone().add(direction);
    const raycastInfo = await physics.raycast(camera.position.toArray(), endpoint.toArray());

    // 2) If the raycast hit something, deal damage to that entity
    if (raycastInfo) {
        const { entityID } = raycastInfo;
        const damage = getEquippedItem()?.damage ?? DAMAGE;
        dealDamage(world)(damage)(entityID);
    }
});
