import { GameSystem } from '@grove/engine';
import HealthScript, { DeathData } from './health';
import { MeshData } from '@grove/graphics';
import { PhysicsData } from '@grove/physics';
import { PLAYER_TAG } from './player';
import { assetLoader, graphics, physics, world } from '@grove/engine';
import AttackScript from '../components/attack';

class GoblinData { }

// window.webApi.onmessage('goblin', () => {
//     log('spawn enemy');
//     this.createGoblin();
// });

export default class GoblinScript extends GameSystem {
    shootTimer?: NodeJS.Timer;

    async init() {
        // setInterval(this.createGoblin, 30_000);
    }

    every_frame() {
        world.executeQuery([MeshData, GoblinData, DeathData], ([mesh], entity_id) => {
            world.events.emit('enemyDied', { entity_id });
            graphics.removeObjectFromScene(mesh);
            world.deleteEntity(entity_id);
        });
    }

    async createGoblin() {
        const goblin = world.spawn([
            HealthScript.bahavior(3, 3),
            AttackScript.behavior(world.getTag(PLAYER_TAG)),
        ]);

        const mesh = await assetLoader.loadModel('./models/villager-male/villager-male.glb');
        mesh.traverse(node => node.userData.entityId = goblin); // create relationship between mesh->entity
        graphics.addObjectToScene(mesh);

        const body = physics.createCapsule({
            mass: 10,
            pos: [10, 50, 0],
            shouldRotate: false,
            radius: 0.7,
            height: 1.7
        });

        const gbln = {};

        world.setComponent(goblin, [MeshData, PhysicsData, GoblinData], [mesh, body, gbln]);
    }
}
