import anime from 'animejs';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { CAMERA_TAG, CameraData, GraphicsData } from '../graphics/graphics';

export default class SwordScript extends GameScript {
    sword: Entity;

    // eslint-disable-next-line class-methods-use-this
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

        document.addEventListener('click', () => {
            anime({
                targets: this.sword.getComponent(GraphicsData).rotation,
                keyframes: [
                    { x: -Math.PI / 2 },
                    { x: 0 },
                ],
                duration: 4000,
                easing: 'linear',
            });
        });
    }
}
