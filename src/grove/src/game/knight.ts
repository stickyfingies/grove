import { AnimationData, MeshData, animate } from '@grove/graphics';
import { PhysicsData } from "@grove/physics";
import { graphics, physics, world, GameSystem } from "@grove/engine";

import { Health, Death } from "./health";
import { player } from './player';
import { distance, divide, multiply, norm, subtract } from 'mathjs';
import { Vec3 } from 'physics/dist';

export class KnightData { }

/**
 * Delta: (-Entity)
 */
world.addRule({
    name: 'Dead knights disappear',
    group: [AnimationData, KnightData, Death],
    each_frame([anim], entity) {
        animate(anim, 'Death_A_Pose');
        world.deleteComponent(entity, [Death]);
        setTimeout(() => world.deleteEntity(entity), 5000);
    }
});

world.addRule({
    name: 'Knights follow the player',
    group: [PhysicsData, AnimationData, Health, KnightData],
    each_frame([knightBody, knightAnim]) {
        const [playerBody] = world.get(player, [PhysicsData]);
        const playerpos = physics.getBodyPosition(playerBody);
        const knightpos = physics.getBodyPosition(knightBody);
        const vectorToPlayer = subtract(playerpos, knightpos);
        const distanceToPlayer = distance(playerpos, knightpos) as number;
        
        const normalToPlayer = divide(vectorToPlayer, norm(vectorToPlayer)) as Vec3;

        if (distanceToPlayer < 3) {
            animate(knightAnim, '1H_Melee_Attack_Slice_Diagonal', 1);
            physics.addForce({
                object: playerBody,
                vector: multiply(normalToPlayer, 50000.0)
            });
        }
        else if (distanceToPlayer < 10) {
            animate(knightAnim, 'Running_A');
            physics.addForce({
                object: knightBody,
                vector: normalToPlayer
            });
        } else {
            animate(knightAnim, 'Idle');
        }
    }
});

export default class BarbarianScript extends GameSystem {
    initialize() {
        if (window.webApi) {
            window.webApi.onmessage('barbarian', () => {
                this.spawnBarbarian();
            });
        }

        this.spawnKnight();
    }

    async spawnKnight() {
        const model = await graphics.loadModel('Adventurers/Characters/gltf/Knight.glb');

        animate(model.animationData, 'Idle');

        model.mesh.scale.set(2, 2, 2);

        const capsuleBody = physics.createCapsule({
            mass: 10,
            isGhost: false,
            shouldRotate: true,
        }, {
            pos: [0, 50, -30],
            scale: [1, 1, 1],
            quat: [0, 0, 0, 1]
        }, {
            radius: 0.7,
            height: 1.0
        });

        const health = new Health(10, 10);
        const barbarian = {};

        const knight = world.spawn(
            [MeshData, AnimationData, PhysicsData, Health, KnightData],
            [model.mesh, model.animationData, capsuleBody, health, barbarian]
        );

        model.mesh.traverse(node => { node.userData.entityId = knight; });
    }
}
