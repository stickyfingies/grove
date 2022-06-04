import { Vector3 } from 'three';

import GameScript from '../script';
import { DeathData, HealthData } from './health';
import { MeshData } from '3-AD';
import { PLAYER_TAG } from './player';
import { PhysicsData } from 'firearm';
import { shoot } from './shooting';
import { subtract } from 'mathjs';
import LogService from '../log';

class GoblinData {
    shootTimer?: NodeJS.Timer
}

export default class GoblinScript extends GameScript {
    async init() {
        const [log] = LogService('goblin');

        window.webApi.onmessage('goblin', () => {
            log('spawn enemy');
            this.createGoblin();
        });

        // transfer to damage system
        this.ecs.events.on('dealDamage', (entity: number, dmg: number) => {
            if (!this.ecs.hasComponent(entity, GoblinData)) return;

            const health = this.ecs.getComponent(entity, HealthData);
            if (!health) return;
            health.hp -= dmg;
        });

        await this.createGoblin();
    }

    update() {
        this.ecs.executeQuery([GoblinData, MeshData, DeathData], ([goblinData, mesh], entity) => {
            this.ecs.events.emit('enemyDied');
            clearInterval(goblinData.shootTimer);
            this.graphics.removeObjectFromScene(mesh);
            this.ecs.deleteEntity(entity);
        });
    }

    async createGoblin() {
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
        this.ecs.setComponent(capsule, PhysicsData, capsuleBody);
        this.ecs.setComponent(capsule, HealthData, {
            hp: 3,
            max: 3,
        });

        const player = this.ecs.getTag(PLAYER_TAG);
        const shootTimer = setInterval(() => {
            const playerBody = this.ecs.getComponent(player, PhysicsData);
            const playerPos = this.physics.getBodyPosition(playerBody);
            const capsulePos = this.physics.getBodyPosition(capsuleBody);
            const [x, y, z] = subtract(playerPos, capsulePos);
            mesh.lookAt(playerPos[0], capsulePos[1], playerPos[2]);
            const hitCallback = (entity: number) => {
                // transfer to damage system
                this.ecs.events.emit('dealDamage', entity, 5);
            };
            shoot(
                this.physics,
                this.graphics,
                new Vector3().fromArray(capsulePos),
                new Vector3(x, y, z),
                hitCallback,
            );
        }, 1000);
        this.ecs.setComponent(capsule, GoblinData, {
            shootTimer
        });
    }
}
