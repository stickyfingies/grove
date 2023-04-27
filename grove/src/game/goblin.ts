import { GameSystem } from '@grove/engine';
import Health, { Death } from './health';
import { MeshData } from '@grove/graphics';
import { PhysicsData, RigidBodyDescription } from '@grove/physics';
import { PLAYER_TAG } from './player';
import { assetLoader, graphics, physics, world } from '@grove/engine';
import AttackScript from '../components/attack';
import { Mesh } from 'three';
import { CapsuleShape } from '@grove/engine/lib/load';

class GoblinData { }

// window.webApi.onmessage('goblin', () => {
//     log('spawn enemy');
//     this.createGoblin();
// });

export default class GoblinScript extends GameSystem {
    shootTimer?: NodeJS.Timer;

    async initialize() {
        setInterval(this.createGoblin, 15_000);
    }

    every_frame() {
        world.executeQuery([MeshData, GoblinData, Death], ([mesh], entity_id) => {
            world.events.emit('enemyDied', { entity_id });
            graphics.removeObjectFromScene(mesh);
            world.deleteEntity(entity_id);
        });
    }

    async createGoblin() {
        const goblin = world.createEntity();

        const modelShape = { uri: './models/villager-male/villager-male.glb' };
        const rigidBodyDescription: RigidBodyDescription = {
            mass: 10,
            isGhost: false,
            shouldRotate: false,
        };
        const capsuleShape: CapsuleShape = {
            radius: 0.7,
            height: 1.7
        };
        const health = new Health(3, 3);
        // const attack = new AttackScript(goblin, world.getTag(PLAYER_TAG));
        const gbln = {};

        const mesh = await assetLoader.loadModel(modelShape);
        mesh.traverse(node => node.userData.entityId = goblin); // create relationship between mesh->entity
        graphics.addObjectToScene(mesh);

        const body = physics.createCapsule(rigidBodyDescription, {
            pos: [10, 50, 0],
            scale: [1, 1, 1],
            quat: [0, 0, 0, 1]
        }, capsuleShape);

        world.setComponent(goblin, [PhysicsData, Mesh, GoblinData, Health], [body, mesh, gbln, health]);
    }
}
