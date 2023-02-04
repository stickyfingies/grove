import { Frustum, Matrix4, Mesh } from 'three';
import anime from 'animejs';

import { MeshData } from '@grove/graphics';
import { dealDamage } from './damage.system';
import { ModelShape, assetLoader, graphics, world } from '@grove/engine';
import { getEquippedItem } from './inventory';
import { frustumCamera, PLAYER_TAG } from './player';
import Health from './health';

const DELAY_BETWEEN_SWINGS = 1000; // milliseconds
const DAMAGE = 10; // ???

export const sword = world.createEntity();

const modelShape: ModelShape = { uri: './models/sword-glb/sword.glb' };

const mesh = await assetLoader.loadModel(modelShape);
const [playerMesh] = world.getComponent(world.getTag(PLAYER_TAG), [Mesh]);
mesh.parent = playerMesh;
mesh.scale.set(0.2, 0.2, 0.2);
mesh.position.set(-0.6, 0, 0);
graphics.addObjectToScene(mesh);

world.setComponent(sword, [MeshData], [mesh]);

let lastSwung = 0;

document.addEventListener('mousedown', async (e) => {
    if (e.button !== 0) return;

    if (performance.now() - lastSwung < DELAY_BETWEEN_SWINGS) return;

    lastSwung = performance.now();

    const [swordMesh] = world.getComponent(sword, [MeshData]);

    anime({
        targets: swordMesh.rotation,
        keyframes: [
            { x: Math.PI / 3 },
            { x: 0 },
        ],
        duration: DELAY_BETWEEN_SWINGS,
        easing: 'easeInQuart',
    });

    const frustum = new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(frustumCamera.projectionMatrix, frustumCamera.matrixWorldInverse));
    let foundTarget = false;
    graphics.scene.traverse((node) => {
        if (!foundTarget && node.isMesh && (frustum.containsPoint(node.position) || frustum.intersectsObject(node))) {
            if (world.hasComponent(node.userData.entityId, Health)) {
                foundTarget = true;
                const damage = getEquippedItem()?.damage ?? DAMAGE;
                dealDamage(world)(damage)(node.userData.entityId);
            }
        }
    });
});
