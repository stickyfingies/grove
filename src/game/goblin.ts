import { GameSystem } from '../script';
import HealthScript, { DeathData } from './health';
import { MeshData } from '3-AD';
import { PhysicsData } from 'firearm';
import { PLAYER_TAG } from './player';
import { assetLoader, graphics, physics, world } from '../engine';
import AttackScript from '../components/attack';

class GoblinData {}

// window.webApi.onmessage('goblin', () => {
//     log('spawn enemy');
//     this.createGoblin();
// });

export default class GoblinScript extends GameSystem {
    shootTimer?: NodeJS.Timer;

    async init() {
        setInterval(this.createGoblin, 7_000);
    }

    every_frame() {
        world.executeQuery([MeshData, GoblinData, DeathData], ([mesh], entity) => {
            world.events.emit('enemyDied', entity);
            graphics.removeObjectFromScene(mesh);
            world.deleteEntity(entity);
        });
    }

    async createGoblin() {
        const radius = 0.7;
        const height = 1.7;

        const mesh = await assetLoader.loadModel('./models/villager-male/villager-male.glb');
        graphics.addObjectToScene(mesh);

        const body = physics.createCapsule({
            mass: 10,
            pos: [10, 50, 0],
            fixedRotation: true,
        }, radius, height);

        const goblin = world.spawn([
            HealthScript.bahavior(3, 3),
            AttackScript.behavior(world.getTag(PLAYER_TAG)),
        ]);

        world.setComponent(goblin, MeshData, mesh);
        world.setComponent(goblin, PhysicsData, body);
        world.setComponent(goblin, GoblinData, {});
    }
}
