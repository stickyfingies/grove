import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import { Physics, PhysicsData } from '../physics';

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

        const body = Physics.makeCube(100, 1.39);
        body.allowSleep = false;
        body.position.set(randomPos(), 30, randomPos());
        slime.setComponent(PhysicsData, body);
    }
}
