import GameScript from '../script';
import { HealthData } from './health';
import { MeshData } from '3-AD';
import { PLAYER_TAG } from './player';
import { PhysicsData } from 'firearm';
import LogService from '../log';
import { Vector3 } from 'three';
import { distance, multiply, subtract } from 'mathjs';

const [log] = LogService('slime');

/** Basically tags entities as being slimes */
class SlimeData {
    speed = 0.75;

    lastHop = performance.now();
}

export default class SlimeScript extends GameScript {
    init() {
        setInterval(this.createSlime, 1200);

        this.ecs.events.on(`delete${HealthData.name}Component`, (entity: number) => {
            // make sure it's really a slime (this is a generic death event)
            if (!this.ecs.hasComponent(entity, SlimeData)) return;

            this.ecs.events.emit('enemyDied');

            const mesh = this.ecs.getComponent(entity, MeshData);
            this.graphics.removeObjectFromScene(mesh);
            this.ecs.deleteEntity(entity);
            log('death');
        });

        this.ecs.events.on('collision', ({ id0, id1 }) => {
            if (this.ecs.hasComponent(id0, SlimeData) && id1 === this.ecs.getTag(PLAYER_TAG)) {
                this.ecs.events.emit('dealDamage', id1, 3);
            }
        });

        this.ecs.events.on('dealDamage', (entity: number, dmg: number) => {
            if (!this.ecs.hasComponent(entity, SlimeData)) return;

            const health = this.ecs.getComponent(entity, HealthData);
            if (!health) return;
            health.hp -= dmg;
        });
    }

    update() {
        const player = this.ecs.getTag(PLAYER_TAG);
        const playerBody = this.ecs.getComponent(player, PhysicsData);

        const slimes = this.ecs.submitQuery(new Set([SlimeData]));

        for (const slime of slimes) {
            const slimeBody = this.ecs.getComponent(slime, PhysicsData);

            const playerPos = this.physics.getBodyPosition(playerBody);
            const slimePos = this.physics.getBodyPosition(slimeBody);

            const distanceToPlayer = distance(playerPos, slimePos);;
            const vectorToPlayer = subtract(playerPos, slimePos);

            const { speed, lastHop } = this.ecs.getComponent(slime, SlimeData);

            let targets = 0;
            let slimesInVicinity = 0;
            const accumulatedVelocity = new Vector3(0, 0, 0);

            // The player is a valid target if they are closeby.
            if (distanceToPlayer < 20) {
                const velocity = multiply(vectorToPlayer, speed * 5);

                // The player should be weighted as a higher priority target than other slimes.
                // Multiplying everything by 20 biases the final average towards the player.
                accumulatedVelocity.x += velocity[0] * 20;
                accumulatedVelocity.z += velocity[2] * 20;
                targets += 20;
            }
            // Other slimes are also valid targets; this causes their 'clumping' behavior.
            if (Math.random() <= 0.02) {
                for (const other of slimes) {
                    if (other === slime) return;

                    const otherBody = this.ecs.getComponent(other, PhysicsData);
                    const otherPos = this.physics.getBodyPosition(otherBody);

                    const distanceToOther = distance(otherPos, slimePos);
                    const vectorToOther = subtract(otherPos, slimePos);

                    if (distanceToOther < 20) {
                        slimesInVicinity += 1;
                        targets += 1;
                        const velocity = multiply(vectorToOther, speed * 3);
                        accumulatedVelocity.x += velocity[0];
                        accumulatedVelocity.y += velocity[1];
                        accumulatedVelocity.z += velocity[2];
                    }
                }
            }

            if (slimesInVicinity > 0) {
                const slimeMesh = this.ecs.getComponent(slime, MeshData);
                const blueness = Math.max(Math.min(slimesInVicinity / 12, 1), 0.02738276869058609);
                // @ts-ignore
                slimeMesh.children[0].material.color.b = blueness;
                // @ts-ignore
                this.graphics.updateMaterial(slimeMesh);
            }

            // Hop towards the average target position
            if (targets && (performance.now() - lastHop) > 1125) {
                this.ecs.getComponent(slime, SlimeData).lastHop = performance.now();

                // Find the average velocity target
                accumulatedVelocity.x /= targets;
                accumulatedVelocity.z /= targets;

                // Add a hop force if the slime is standing on something
                this.physics.addForceConditionalRaycast(
                    slimeBody,
                    [accumulatedVelocity.x, 30, accumulatedVelocity.z],
                    slimePos,
                    [
                        slimePos[0],
                        slimePos[1] - 1.5,
                        slimePos[2],
                    ],
                );
            }
        }
    }

    async createSlime() {
        const slime = this.ecs.createEntity();

        this.ecs.setComponent(slime, SlimeData, { speed: 0.75, lastHop: performance.now() });

        this.ecs.setComponent(slime, HealthData, { hp: 5, max: 5 });

        const mesh = await this.assetLoader.loadModel('./models/slime/slime.glb');
        // @ts-ignore
        mesh.children[1].material = mesh.children[1].material.clone();
        mesh.scale.set(0.7, 0.7, 0.7);
        this.graphics.addObjectToScene(mesh);
        this.ecs.setComponent(slime, MeshData, mesh);

        const randomPos = () => Math.random() * 150 - 75;

        const body = this.physics.createSphere({
            mass: 10,
            pos: [randomPos(), 60, randomPos()],
            fixedRotation: true,
        }, 1.39 / 2);
        this.ecs.setComponent(slime, PhysicsData, body);
    }
}
