import { MeshData } from '@grove/graphics';
import { PhysicsData } from "@grove/physics";
import { assetLoader, graphics, physics, world, GameSystem } from "@grove/engine";

import Health, { Death } from "./health";

export class BarbarianData { }

world.addRule({
    name: 'Dead barbarians disappear',
    types: [MeshData, BarbarianData, Death],
    fn([mesh], entity) {
        graphics.removeObjectFromScene(mesh);
        world.deleteEntity(entity);
    }
});

export default class BarbarianScript extends GameSystem {
    initialize() {
        if (window.webApi) {
            window.webApi.onmessage('barbarian', () => {
                this.spawnBarbarian();
            });
        }

        this.spawnBarbarian();
    }

    async spawnBarbarian() {
        const radius = 0.7;
        const height = 1.7;

        const capsuleBody = physics.createCapsule({
            mass: 10,
            isGhost: false,
            shouldRotate: false,
        }, {
            pos: [0, 50, 30],
            scale: [1, 1, 1],
            quat: [0, 0, 0, 1]
        }, {
            radius,
            height
        });

        const mesh = await assetLoader.loadModel({ uri: './models/villager-male/villager-male.glb' });
        graphics.addObjectToScene(mesh);

        const health = new Health(1, 1);
        const barbarian = {};

        world.spawn(
            [MeshData, PhysicsData, Health, BarbarianData],
            [mesh, capsuleBody, health, barbarian]
        );
    }
}
