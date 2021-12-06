import { Vec3 } from 'cannon-es';
import { Vector3 } from 'three';
import anime from 'animejs';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { CAMERA_TAG, CameraData, GraphicsData } from '../graphics/graphics';

export default class SwordScript extends GameScript {
    sword!: Entity;

    lastSwung = performance.now();

    init() {
        this.sword = new Entity();
        const camera = Entity.getTag(CAMERA_TAG);

        this.assetLoader.loadModel('/models/sword-glb/sword.glb')
            .then((mesh) => {
                mesh.scale.set(0.1, 0.1, 0.1);
                mesh.parent = camera.getComponent(CameraData);
                mesh.translateX(0.5);
                mesh.translateY(-0.7);
                mesh.translateZ(-1.3);
                this.sword.setComponent(GraphicsData, mesh);
            });

        document.addEventListener('mousedown', async (e) => {
            if (e.button !== 0) return;

            // wait 3/4 of a second between swings
            if (performance.now() - this.lastSwung < 750) return;

            this.lastSwung = performance.now();

            // 0.5 second upswing and downswing
            anime({
                targets: this.sword.getComponent(GraphicsData).rotation,
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
            const from = new Vec3(camData.position.x, camData.position.y, camData.position.z);
            const to = new Vec3(from.x + camDir.x, from.y + camDir.y, from.z + camDir.z);
            const raycastInfo = await this.physics.raycast(from, to);

            // 2) If the raycast hit something, deal damage to that entity
            if (raycastInfo) {
                const { entityID, hitPoint } = raycastInfo;
                if (hitPoint.distanceTo(from) < 3.0) this.ecs.events.emit('dealDamage', entityID, 10);
            }
        });
    }
}
