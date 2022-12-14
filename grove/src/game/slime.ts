import { GameSystem } from '@grove/engine';
import HealthScript, { DeathData } from './health';
import { MeshData } from '@grove/graphics';
import { PLAYER_TAG } from './player';
import { PhysicsData } from '@grove/physics';
import { LogService } from '@grove/engine';
import { Vector3 } from 'three';
import { distance, multiply, subtract } from 'mathjs';
import { dealDamage } from './damage.system';
import { assetLoader, graphics, physics, world } from '@grove/engine';

const [log] = LogService('slime');

/** Basically tags entities as being slimes */
class SlimeData {
    speed = 0.75;

    lastHop = performance.now();
}

export default class SlimeScript extends GameSystem {
    init() {
        window.webApi.onmessage('slime', () => {
            log('spawn enemy');
            for (let i = 0; i < 20; i++)
                this.createSlime();
        });

        setInterval(this.createSlime, 5000);

        // deal melee damage on contact
        const player = world.getTag(PLAYER_TAG);
        world.events.on('collision', ({ id0, id1 }) => {
            if (world.hasComponent(id0, SlimeData) && id1 === player) {
                dealDamage(world)(3)(id1);
            }
        });
    }

    every_frame() {
        const player = world.getTag(PLAYER_TAG);
        const playerBody = world.getComponent(player, PhysicsData);

        // handle dead slimes
        world.executeQuery([MeshData, SlimeData, DeathData], ([mesh], entity) => {
            world.events.emit('enemyDied', entity);
            graphics.removeObjectFromScene(mesh);
            world.deleteEntity(entity);
        });

        // handle living slimes (behavior skript)
        const slimes = world.submitQuery([PhysicsData, MeshData, SlimeData]);
        for (const [[body, mesh, slimeData], entity] of slimes) {

            const playerPos = physics.getBodyPosition(playerBody);
            const slimePos = physics.getBodyPosition(body);

            const distanceToPlayer = distance(playerPos, slimePos);;
            const vectorToPlayer = subtract(playerPos, slimePos);

            const { speed, lastHop } = slimeData;

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
                for (const [_, other] of slimes) {
                    if (other === entity) return;

                    const otherBody = world.getComponent(other, PhysicsData);
                    const otherPos = physics.getBodyPosition(otherBody);

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
                /// magic numbers.  dunno what the decimal means, or where it comes from.
                const blueness = Math.max(Math.min(slimesInVicinity / 12, 1), 0.02738276869058609);
                // @ts-ignore
                mesh.children[0].material.color.b = blueness;
                graphics.updateMaterial(mesh);
            }

            // Hop towards the average target position
            if (targets && (performance.now() - lastHop) > 1125) {
                slimeData.lastHop = performance.now();

                // Find the average velocity target
                accumulatedVelocity.x /= targets;
                accumulatedVelocity.z /= targets;

                // Add a hop force if the slime is standing on something
                physics.addForceConditionalRaycast(
                    body,
                    [accumulatedVelocity.x, 30, accumulatedVelocity.z],
                    slimePos,
                    [
                        slimePos[0] + (Math.random() * 3 - 1.5),
                        slimePos[1] - 1.5,
                        slimePos[2] + (Math.random() * 3 - 1.5),
                    ],
                );
            }
        }
    }

    async createSlime() {
        const slime = world.createEntity();

        world.setComponent(slime, SlimeData, { speed: 0.75, lastHop: performance.now() });

        world.setComponent(slime, HealthScript, new HealthScript(5, 5));

        const mesh = await assetLoader.loadModel('./models/slime/slime.glb');
        mesh.traverse(node => node.userData.entityId = slime); // create relationship between mesh->entity
        // @ts-ignore
        mesh.children[1].material = mesh.children[1].material.clone();
        mesh.scale.set(0.7, 0.7, 0.7);
        graphics.addObjectToScene(mesh);
        world.setComponent(slime, MeshData, mesh);

        const randomPos = () => Math.random() * 50 - 25;

        const body = physics.createSphere({
            mass: 10,
            pos: [randomPos(), 60, randomPos()],
            shouldRotate: false,
            radius: 1.39 / 2
        });
        // const perception = physics.createSphere({
        //     mass: 100,
        //     shouldRotate: false,
        //     radius: 5,
        //     isGhost: true,
        //     objectToFollow: body
        // });
        // physics.registerCollisionCallback(perception, (entity) => {
        //     console.log(world.getEntityComponentSignature(entity));
        // })
        world.setComponent(slime, PhysicsData, body);
    }
}
