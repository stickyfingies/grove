import { MeshData } from '@grove/graphics';
import { PhysicsData } from "@grove/physics";
import { assetLoader, graphics, physics, world, GameSystem } from "@grove/engine";

import Health, { Death } from "./health";

export class BarbarianData { };

export default class BarbarianScript extends GameSystem {
    initialize() {
        window.webApi.onmessage('barbarian', () => {
            this.spawnBarbarian();
        });

        this.spawnBarbarian();
    }

    every_frame() {
        world.do_with([MeshData, BarbarianData, Death], ([mesh], entity) => {
            graphics.removeObjectFromScene(mesh);
            world.deleteEntity(entity);
        });
    }

    async spawnBarbarian() {
        const radius = 0.7;
        const height = 1.7;

        const capsule = world.createEntity();
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

        world.put(capsule,
            [MeshData, PhysicsData, Health, BarbarianData],
            [mesh, capsuleBody, health, barbarian]
        );
    }
}
