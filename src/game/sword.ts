import { Vector3 } from 'three';
import anime from 'animejs';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { CAMERA_TAG, CameraData, MeshData } from '3-AD';
import { dealDamage } from './damage.system';

export default class SwordScript extends GameScript {
    sword!: Entity;

    lastSwung = performance.now();

    init() {
        this.sword = new Entity();
        const camera = Entity.getTag(CAMERA_TAG);

        this.assetLoader.loadModel('./models/sword-glb/sword.glb')
            .then((mesh) => {
                mesh.scale.set(0.1, 0.1, 0.1);
                mesh.parent = camera.getComponent(CameraData);
                mesh.translateX(0.5);
                mesh.translateY(-0.7);
                mesh.translateZ(-1.3);
                this.graphics.addObjectToScene(mesh);
                this.sword.setComponent(MeshData, mesh);
            });

        document.addEventListener('mousedown', async (e) => {
            if (e.button !== 0) return;

            // wait 3/4 of a second between swings
            if (performance.now() - this.lastSwung < 750) return;

            this.lastSwung = performance.now();

            // 0.5 second upswing and downswing
            anime({
                targets: this.sword.getComponent(MeshData).rotation,
                keyframes: [
                    { x: -Math.PI / 2 },
                    { x: 0 },
                ],
                duration: 1000,
                easing: 'linear',
            });

            // 1) Raycast forwards from camera
            const camData = camera.getComponent(CameraData);
            const camDir = new Vector3();
            camData.getWorldDirection(camDir);
            camDir.multiplyScalar(99);
            const from = new Vector3(camData.position.x, camData.position.y, camData.position.z);
            const to = new Vector3(from.x + camDir.x, from.y + camDir.y, from.z + camDir.z);
            const raycastInfo = await this.physics.raycast(from.toArray(), to.toArray());

            // 2) If the raycast hit something, deal damage to that entity
            if (raycastInfo) {
                const { entityID, hitPoint } = raycastInfo;
                if (new Vector3().fromArray(hitPoint).distanceTo(from) < 3.0) {
                    dealDamage(this.ecs)(entityID)(10);
                }
            }
        });
    }
}
