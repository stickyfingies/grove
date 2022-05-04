import { Vec3 } from 'cannon-es';

import { Vector3 } from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import GraphicsUtils from '../graphics/utils';
import { HealthData } from './health';
import { MeshData } from '3-AD';
import { PLAYER_TAG } from './player';
import { PhysicsData } from 'firearm';
import { shoot } from './shooting';

export default class GoblinScript extends GameScript {
    init() {
        const radius = 0.7;
        const height = 1.7;

        const capsule = this.ecs.createEntity();
        const capsuleBody = this.physics.createCapsule({
            mass: 10,
            pos: new Vec3(10, 50, 0),
            fixedRotation: true,
        }, radius, height);
        const capsuleMesh = GraphicsUtils.makeCapsule(radius, height);
        this.graphics.addObjectToScene(capsuleMesh);
        this.ecs.setComponent(capsule, MeshData, capsuleMesh);
        this.ecs.setComponent(capsule, PhysicsData, capsuleBody);
        this.ecs.setComponent(capsule, HealthData, {
            hp: 3,
            max: 3,
        });

        const hitCallback = (entity: number) => {
            if (entity === this.ecs.getTag(PLAYER_TAG)) {
                this.ecs.events.emit('dealDamage', entity, 5);
            }
        };

        setInterval(() => {
            const playerBody = this.ecs.getComponent(this.ecs.getTag(PLAYER_TAG), PhysicsData);
            const { x, y, z } = playerBody.position.vsub(capsuleBody.position);
            shoot(
                this.physics,
                this.graphics,
                new Entity(Entity.defaultManager, capsule),
                new Vector3(x, y, z),
                hitCallback,
            );
        }, 1000);
    }
}
