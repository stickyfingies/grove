import { Mesh, MeshPhongMaterial, SphereBufferGeometry, Vector3 } from 'three';

import { Graphics } from '@grove/graphics';
import { Physics, PhysicsData, Vec3 } from '@grove/physics';
import { world } from '@grove/engine';

const sound = new Audio('/audio/pop.wav');

/** Shoots a ball outwards from an entity in an indicated direction */
export function shoot(
    physics: Physics,
    graphics: Graphics,
    origin: Vector3,
    shootDir: Vector3,
    cb?: (e: number, b: number) => void,
): number {
    const ball = world.createEntity();

    const [px, py, pz] = origin.toArray();
    const { x: sdx, y: sdy, z: sdz } = shootDir.normalize();

    const radius = 0.3;
    const mass = 10;
    const shootVelo = 40;
    const distanceFromOrigin = 2;

    const velocity: Vec3 = [
        sdx * shootVelo,
        sdy * shootVelo,
        sdz * shootVelo,
    ];
    const position: Vec3 = [
        px + sdx * distanceFromOrigin,
        py + sdy * distanceFromOrigin,
        pz + sdz * distanceFromOrigin,
    ];

    const body = physics.createSphere({
        mass,
        isGhost: false,
        shouldRotate: true
    }, {
        pos: position,
        scale: [1, 1, 1],
        quat: [0, 0, 0, 1]
    }, {
        radius
    });
    physics.addVelocity({ object: body, vector: velocity });

    const geometry = new SphereBufferGeometry(radius, 1, 1);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'Bullet';
    graphics.addObjectToScene(mesh);
    world.put(ball, [Mesh, PhysicsData], [mesh, body]);

    const collideCb = (entity: number) => {
        physics.removeCollisionCallback(body);
        cb?.(entity, ball);
        // setTimeout(() => {
        physics.removeBody(body);
        graphics.removeObjectFromScene(mesh);
        world.deleteEntity(ball);
        // sound.currentTime = 0;
        // sound.play();
        // }, 1500);
    };

    physics.registerCollisionCallback(body, collideCb);

    return ball;
};
