import { GameSystem } from '@grove/engine';
import Health, { Death } from './health';
import { MeshData } from '@grove/graphics';
import { PhysicsData, RigidBodyDescription } from '@grove/physics';
import { PLAYER_TAG } from './player';
import { assetLoader, graphics, physics, world } from '@grove/engine';
import {Attacker} from './attack';
import { Mesh } from 'three';
import { CapsuleShape } from '@grove/engine/lib/load';

export class Goblin { }

// A "Goblin" is an [avatar](./model/path.glb).
// which [target, shoot]s the [player].

// window.webApi.onmessage('goblin', () => {
//     log('spawn enemy');
//     this.createGoblin();
// });

world.addRule({
    types: [MeshData, Goblin, Death],
    fn([mesh], entity) {
        world.events.emit('enemyDied', { entity });
        graphics.removeObjectFromScene(mesh);
        world.deleteEntity(entity);
    }
});

export default class GoblinScript extends GameSystem {
    shootTimer?: NodeJS.Timer;

    async initialize() {
        setInterval(this.createGoblin, 15_000);
    }

    async createGoblin() {

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
        const gbln = {};

        const mesh = await assetLoader.loadModel(modelShape);
        graphics.addObjectToScene(mesh);

        const body = physics.createCapsule(rigidBodyDescription, {
            pos: [10, 50, 0],
            scale: [1, 1, 1],
            quat: [0, 0, 0, 1]
        }, capsuleShape);

        const goblin = world.spawn(
            [PhysicsData, Mesh, Goblin, Health],
            [body, mesh, gbln, health]
        );

        mesh.traverse(node => { node.userData.entityId = goblin; }); // create relationship between mesh->entity

        const attack = new Attacker(world.getTag(PLAYER_TAG));
        world.put(goblin, [Attacker], [attack]);

    }
}
