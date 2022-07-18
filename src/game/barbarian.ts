import { MeshData } from "3-AD";
import { PhysicsData } from "firearm";
import GameScript from "../script";
import { DeathData, HealthData } from "./health";

export class BarbarianData { };

export default class BarbarianScript extends GameScript {
    init() {
        window.webApi.onmessage('barbarian', () => {
            this.spawnBarbarian();
        });

        this.spawnBarbarian();
    }

    update() {
        this.ecs.executeQuery([MeshData, BarbarianData, DeathData], ([mesh], entity) => {
            this.graphics.removeObjectFromScene(mesh);
            this.ecs.deleteEntity(entity);
        });
    }

    async spawnBarbarian() {
        const radius = 0.7;
        const height = 1.7;

        const capsule = this.ecs.createEntity();
        const capsuleBody = this.physics.createCapsule({
            mass: 10,
            pos: [10, 50, 0],
            fixedRotation: true,
        }, radius, height);

        const mesh = await this.assetLoader.loadModel('./models/villager-male/villager-male.glb');

        this.graphics.addObjectToScene(mesh);
        this.ecs.setComponent(capsule, MeshData, mesh);
        this.ecs.setComponent(capsule, HealthData, {
            hp: 10,
            max: 10,
        });
        this.ecs.setComponent(capsule, PhysicsData, capsuleBody);
        this.ecs.setComponent(capsule, BarbarianData, {});
    }
}