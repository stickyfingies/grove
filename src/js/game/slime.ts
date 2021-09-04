import { Vec3 } from 'cannon-es';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import { PhysicsData } from '../physics';

export default class SlimeScript extends GameScript {
    init() {
        for (let i = 0; i < 6; i++) {
            this.createSlime();
        }
    }

    async createSlime() {
        const slime = new Entity();

        const mesh = await this.assetLoader.loadModel('/models/slime/slime.glb');
        mesh.name = 'Slime';
        // mesh.scale.set(5, 5, 5);
        slime.setComponent(GraphicsData, mesh);

        const randomPos = () => Math.random() * 150 - 75;

        const pos = new Vec3(randomPos(), 60, randomPos());
        const body = this.physics.createCube({
            mass: 1,
            pos,
        }, 1.39 * 2);
        slime.setComponent(PhysicsData, body);
    }
}
