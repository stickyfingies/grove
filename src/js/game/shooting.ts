import { Vector3 } from 'three';

import Entity from '../ecs/entity';
import { GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { Physics, PhysicsData } from '../physics';

/** Shoots a ball outwards from an entity in an indicated direction */
const shoot = (origin: Entity, shootDir: Vector3) => {
    const ball = new Entity();

    const { x: px, y: py, z: pz } = origin.getComponent(PhysicsData).position;
    const { x: vx, y: vy, z: vz } = origin.getComponent(PhysicsData).velocity;
    const { x: sdx, y: sdy, z: sdz } = shootDir;

    const radius = 0.3;
    const mass = 10;
    const shootVelo = 40;
    const distanceFromOrigin = 2;

    const body = Physics.makeBall(mass, radius);
    body.velocity.set(
        vx + sdx * shootVelo,
        vy + sdy * shootVelo,
        vz + sdz * shootVelo,
    );
    body.position.set(
        px + sdx * distanceFromOrigin,
        py + sdy * distanceFromOrigin,
        pz + sdz * distanceFromOrigin,
    );
    ball.setComponent(PhysicsData, body);

    const mesh = GraphicsUtils.makeBall(radius);
    ball.setComponent(GraphicsData, mesh);

    const collideCb = () => {
        body.removeEventListener('collide', collideCb);
        setTimeout(ball.delete, 1500);
    };

    body.addEventListener('collide', collideCb);

    return ball;
};

export default shoot;
