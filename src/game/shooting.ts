import { Mesh, MeshPhongMaterial, SphereBufferGeometry, Vector3 } from 'three';

import Entity from '../ecs/entity';

import { Graphics, MeshData } from '3-AD';
import { Physics, PhysicsData } from 'firearm';

/** Shoots a ball outwards from an entity in an indicated direction */
export function shoot(
    physics: Physics,
    graphics: Graphics,
    origin: Entity,
    shootDir: Vector3,
    cb?: (e: number) => void,
): Entity {
    const ball = new Entity();

    const [px, py, pz] = physics.getBodyPosition(origin.getComponent(PhysicsData));
    const { x: sdx, y: sdy, z: sdz } = shootDir.normalize();

    const radius = 0.3;
    const mass = 10;
    const shootVelo = 40;
    const distanceFromOrigin = 2;

    const velocity = [
        sdx * shootVelo,
        sdy * shootVelo,
        sdz * shootVelo,
    ];
    const position = [
        px + sdx * distanceFromOrigin,
        py + sdy * distanceFromOrigin,
        pz + sdz * distanceFromOrigin,
    ];

    const body = physics.createSphere({
        mass,
        pos: position,
    }, radius);
    physics.addVelocity(body, velocity);
    ball.setComponent(PhysicsData, body);

    const geometry = new SphereBufferGeometry(radius, 1, 1);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);
    graphics.addObjectToScene(mesh);
    ball.setComponent(MeshData, mesh);

    const collideCb = (entity: number) => {
        physics.removeCollisionCallback(body);
        cb?.(entity);
        // setTimeout(() => {
            physics.removeBody(body);
            graphics.removeObjectFromScene(mesh);
            ball.delete();
        // }, 1500);
    };

    physics.registerCollisionCallback(body, collideCb);

    return ball;
};
