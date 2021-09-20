import { Vec3 } from 'cannon-es';

import EcsView from '../ecs/view';
import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import { HealthData } from './health';
import { PLAYER_TAG } from './player';
import { PhysicsData } from '../physics';

/** Basically tags entities as being slimes */
class SlimeData {}

export default class SlimeScript extends GameScript {
    slimeView = new EcsView(this.ecs, new Set([SlimeData]))

    init() {
        for (let i = 0; i < 6; i++) {
            this.createSlime();
        }

        this.ecs.events.on(`delete${HealthData.name}Component`, (id: number) => {
            // make sure it's really a hominid (this is a generic death event)
            const entity = new Entity(Entity.defaultManager, id);
            if (!entity.hasComponent(SlimeData)) return;

            const body = entity.getComponent(PhysicsData);
            this.physics.removeBody(body);
            entity.delete();
        });

        // make the sword raycast in the physics realm

        this.ecs.events.on('dealDamage', (id: number) => {
            const entity = new Entity(Entity.defaultManager, id);
            if (!entity.hasComponent(SlimeData)) return;

            console.log('fuck mate, i got hurt');

            const health = entity.getComponent(HealthData);
            if (!health) return;
            health.hp -= 999999;
        });
    }

    update(dt: number) {
        const player = Entity.getTag(PLAYER_TAG);
        const playerBody = player.getComponent(PhysicsData);

        this.slimeView.iterateView((slime) => {
            const slimeBody = slime.getComponent(PhysicsData);

            const distanceToPlayer = playerBody.position.distanceTo(slimeBody.position);
            const vectorToPlayer = playerBody.position.vsub(slimeBody.position);

            const speed = 0.75;

            if (distanceToPlayer < 20) {
                const velocity = vectorToPlayer.scale(speed);
                this.physics.addVelocity(slimeBody, new Vec3(velocity.x, 0, velocity.z));
            }
        });
    }

    async createSlime() {
        const slime = new Entity();

        slime.setComponent(SlimeData, {});

        slime.setComponent(HealthData, { hp: 5, max: 5 });

        const mesh = await this.assetLoader.loadModel('/models/slime/slime.glb');
        mesh.name = 'Slime';
        // mesh.scale.set(5, 5, 5);
        slime.setComponent(GraphicsData, mesh);

        const randomPos = () => Math.random() * 150 - 75;

        const pos = new Vec3(randomPos(), 60, randomPos());
        const body = this.physics.createSphere({
            mass: 1,
            pos,
            fixedRotation: true,
        }, 1.39 / 2);
        slime.setComponent(PhysicsData, body);

        this.physics.registerCollisionCallback(body, (id) => {
            const health = slime.getComponent(HealthData);
            health.hp -= 1;
        });
    }
}
