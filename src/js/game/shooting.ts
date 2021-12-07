import { Vec3 } from 'cannon-es';
import { Vector3 } from 'three';

import Entity from '../ecs/entity';
import GraphicsUtils from '../graphics/utils';
import { Graphics, MeshData } from '../graphics/graphics';
import { Physics, PhysicsData } from '../physics';

/** Shoots a ball outwards from an entity in an indicated direction */
const shoot = (
    physics: Physics,
    graphics: Graphics,
    origin: Entity,
    shootDir: Vector3,
    cb?: (e: number) => void,
) => {
    const ball = new Entity();

    const { x: px, y: py, z: pz } = origin.getComponent(PhysicsData).position;
    const { x: vx, y: vy, z: vz } = origin.getComponent(PhysicsData).velocity;
    const { x: sdx, y: sdy, z: sdz } = shootDir.normalize();

    const radius = 0.3;
    const mass = 10;
    const shootVelo = 40;
    const distanceFromOrigin = 2;

    const velocity = new Vec3(
        vx + sdx * shootVelo,
        vy + sdy * shootVelo,
        vz + sdz * shootVelo,
    );
    const position = new Vec3(
        px + sdx * distanceFromOrigin,
        py + sdy * distanceFromOrigin,
        pz + sdz * distanceFromOrigin,
    );

    const body = physics.createSphere({
        mass,
        pos: position,
    }, radius);
    physics.addVelocity(body, velocity);
    ball.setComponent(PhysicsData, body);

    const mesh = GraphicsUtils.makeBall(radius);
    graphics.addObjectToScene(mesh);
    ball.setComponent(MeshData, mesh);

    const collideCb = (entity: number) => {
        physics.removeCollisionCallback(body);
        cb?.(entity);
        setTimeout(() => {
            physics.removeBody(body);
            graphics.removeObjectFromScene(mesh);
            ball.delete();
        }, 1500);
    };

    physics.registerCollisionCallback(body, collideCb);

    return ball;
};

export default shoot;
