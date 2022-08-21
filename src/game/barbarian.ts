import { MeshData } from "3-AD";
import { PhysicsData } from "firearm";
import { assetLoader, graphics, physics, world } from "../engine";
import { GameSystem } from "../script";
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
            fixedRotation: true,
            radius,
            height
        });

        const mesh = await assetLoader.loadModel('./models/villager-male/villager-male.glb');

        graphics.addObjectToScene(mesh);
        world.setComponent(capsule, MeshData, mesh);
        world.setComponent(capsule, HealthScript, new HealthScript(1, 1));
        world.setComponent(capsule, PhysicsData, capsuleBody);
        world.setComponent(capsule, BarbarianData, {});
    }
}
