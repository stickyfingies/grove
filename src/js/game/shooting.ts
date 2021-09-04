import { Vec3 } from 'cannon-es';
import { Vector3 } from 'three';

import Entity from '../ecs/entity';
import { GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { Physics, PhysicsData } from '../physics';

/** Shoots a ball outwards from an entity in an indicated direction */
const shoot = (physics: Physics, origin: Entity, shootDir: Vector3) => {
    const ball = new Entity();

    const { x: px, y: py, z: pz } = origin.getComponent(PhysicsData).position;
    const { x: vx, y: vy, z: vz } = origin.getComponent(PhysicsData).velocity;
    const { x: sdx, y: sdy, z: sdz } = shootDir;

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
    ball.setComponent(GraphicsData, mesh);

    const collideCb = () => {
        physics.removeCollisionCallback(body);
        setTimeout(() => {
            physics.removeBody(body);
            ball.delete();
        }, 1500);
    };

    physics.registerCollisionCallback(body, collideCb);

    return ball;
};

export default shoot;
