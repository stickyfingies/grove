import { CylinderBufferGeometry, Mesh, MeshPhongMaterial, SphereBufferGeometry, Vector3 } from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { HealthData } from './health';
import { MeshData } from '3-AD';
import { PLAYER_TAG } from './player';
import { PhysicsData } from 'firearm';
import { shoot } from './shooting';
import { subtract } from 'mathjs';

export default class GoblinScript extends GameScript {
    init() {
        const radius = 0.7;
        const height = 1.7;

        const capsule = this.ecs.createEntity();
        const capsuleBody = this.physics.createCapsule({
            mass: 10,
            pos: [10, 50, 0],
            fixedRotation: true,
        }, radius, height);
        const material = new MeshPhongMaterial({ color: 0x00CCFF });

        const cGeometry = new CylinderBufferGeometry(radius, radius, height, 32);
        const sGeometry = new SphereBufferGeometry(radius, 32, 32);

        const capsuleMesh = new Mesh(cGeometry, material);
        const sphereTopMesh = new Mesh(sGeometry, material);
        const sphereBottomMesh = new Mesh(sGeometry, material);
        sphereTopMesh.position.y = height / 2;
        sphereBottomMesh.position.y = -height / 2;
        capsuleMesh.add(sphereTopMesh);
        capsuleMesh.add(sphereBottomMesh);

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
            const playerPos = this.physics.getBodyPosition(playerBody);
            const capsulePos = this.physics.getBodyPosition(capsuleBody);
            const [ x, y, z ] = subtract(playerPos, capsulePos);
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
