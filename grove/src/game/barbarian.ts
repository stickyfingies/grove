import { MeshData } from '@grove/graphics';
import { PhysicsData } from "@grove/physics";
import { assetLoader, graphics, physics, world, GameSystem } from "@grove/engine";

import HealthScript, { DeathData } from "./health";

export class BarbarianData { };

export default class BarbarianScript extends GameSystem {
    init() {
        window.webApi.onmessage('barbarian', () => {
            this.spawnBarbarian();
        });

        this.spawnBarbarian();
    }

    every_frame() {
        world.executeQuery([MeshData, BarbarianData, DeathData], ([mesh], entity) => {
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
            pos: [0, 50, 30],
            shouldRotate: false,
            radius,
            height
        });

        const mesh = await assetLoader.loadModel('./models/villager-male/villager-male.glb');
        graphics.addObjectToScene(mesh);

        const health = new HealthScript(1, 1);
        const barbarian = {};

        world.setComponent(capsule,
            [MeshData, PhysicsData, HealthScript, BarbarianData],
            [mesh, capsuleBody, health, barbarian]
        );
    }
}
