import { Vec3 } from 'cannon-es';

import GameScript from '../script';
import { HealthData } from './health';
import { MeshData } from '../graphics/graphics';
import { PLAYER_TAG } from './player';
import { PhysicsData } from '../physics';

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
            console.log('f');
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

    update(dt: number) {
        const player = this.ecs.getTag(PLAYER_TAG);
        const playerBody = this.ecs.getComponent(player, PhysicsData);

        const slimes = this.ecs.submitQuery(new Set([SlimeData]));

        for (const slime of slimes) {
            const slimeBody = this.ecs.getComponent(slime, PhysicsData);

            const distanceToPlayer = playerBody.position.distanceTo(slimeBody.position);
            const vectorToPlayer = playerBody.position.vsub(slimeBody.position);

            const { speed, lastHop } = this.ecs.getComponent(slime, SlimeData);

            let targets = 0;
            let slimesInVicinity = 0;
            const accumulatedVelocity = new Vec3(0, 0, 0);

            // The player is a valid target if they are closeby.
            if (distanceToPlayer < 20) {
                const velocity = vectorToPlayer.scale(speed * 5);

                // The player should be weighted as a higher priority target than other slimes.
                // Multiplying everything by 20 biases the final average towards the player.
                accumulatedVelocity.x += velocity.x * 20;
                accumulatedVelocity.z += velocity.z * 20;
                targets += 20;
            }
            // Other slimes are also valid targets; this causes their 'clumping' behavior.
            if (Math.random() <= 0.02) {
                for (const other of slimes) {
                    if (other === slime) return;

                    const otherBody = this.ecs.getComponent(other, PhysicsData);

                    const distanceToOther = otherBody.position.distanceTo(slimeBody.position);
                    const vectorToOther = otherBody.position.vsub(slimeBody.position);

                    if (distanceToOther < 20) {
                        slimesInVicinity += 1;
                        targets += 1;
                        const velocity = vectorToOther.scale(speed * 3);
                        accumulatedVelocity.x += velocity.x;
                        accumulatedVelocity.y += velocity.y;
                        accumulatedVelocity.z += velocity.z;
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
                    new Vec3(accumulatedVelocity.x, 30, accumulatedVelocity.z),
                    slimeBody.position,
                    new Vec3(
                        slimeBody.position.x,
                        slimeBody.position.y - 1.5,
                        slimeBody.position.z,
                    ),
                );
            }
        }
    }

    async createSlime() {
        const slime = this.ecs.createEntity();

        this.ecs.setComponent(slime, SlimeData, { speed: 0.75, lastHop: performance.now() });

        this.ecs.setComponent(slime, HealthData, { hp: 5, max: 5 });

        const mesh = await this.assetLoader.loadModel('/models/slime/slime.glb');
        // @ts-ignore
        mesh.children[1].material = mesh.children[1].material.clone();
        mesh.scale.set(0.7, 0.7, 0.7);
        this.graphics.addObjectToScene(mesh);
        this.ecs.setComponent(slime, MeshData, mesh);

        const randomPos = () => Math.random() * 150 - 75;

        const pos = new Vec3(randomPos(), 60, randomPos());
        const body = this.physics.createSphere({
            mass: 10,
            pos,
            fixedRotation: true,
        }, 1.39 / 2);
        this.ecs.setComponent(slime, PhysicsData, body);
    }
}
