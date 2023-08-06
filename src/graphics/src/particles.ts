import {
    Points,
    BufferGeometry,
    Vector3,
    Camera,
} from 'three';

import Utils from './utils';

export interface Particle {
    position: Vector3;
    velocity: Vector3;
    acceleration: Vector3;
    angle: number;
    size: number;
}

export interface ParticleSystem {
    emitter: Points,
    geometry: BufferGeometry,
    age: number,
    max_age: number,
    particles: Particle[]
}

/**
 * @returns `true` if the particle emitter should be removed from the scene.
 */
export function updateParticleSystem(particle_system: ParticleSystem, camera: Camera, delta: number) {
    const { geometry, particles, emitter } = particle_system;

    // Update particles
    // ! TODO move this computation to the GPU by embedding it in a shader
    for (const particle of particles) {

        // Point Attractor behavior
        {
            const attractorForce = emitter.position.clone().sub(particle.position);
            const distance = attractorForce.length();

            const MIN_DISTANCE = 5;
            const MAX_DISTANCE = 10;

            if (distance > MIN_DISTANCE && distance < MAX_DISTANCE) {
                attractorForce.normalize()
                    .multiplyScalar(1.0 - distance / (MAX_DISTANCE - MIN_DISTANCE))
                    .addScalar(Math.random() * 0.04);

                particle.acceleration.add(attractorForce.multiplyScalar(Math.random()).multiplyScalar(delta));
            }
        }

        // exp. attractor: add (direction to center) to velocity
        particle.acceleration = emitter.position.clone().sub(particle.position).normalize();

        particle.velocity.add(particle.acceleration.clone().multiplyScalar(delta));
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        particle.angle += delta * 0.1;
    }

    // Kill system if necessary
    particle_system.age += delta;
    if (particle_system.age > particle_system.max_age) return true;

    // Sort particles in terms of their distance to the camera.
    // This ensures that they render in the appropriate order.
    particles.sort((a, b) => {
        const d1 = camera.position.distanceTo(a.position);
        const d2 = camera.position.distanceTo(b.position);
        if (d1 > d2) return -1;
        if (d1 < d2) return 1;
        return 0;
    });

    // Update attribute buffer on GPU
    Utils.updateBufferAttribute(geometry, 'position', particles.flatMap(({ position: { x, y, z } }) => [x, y, z]));
    Utils.updateBufferAttribute(geometry, 'size', particles.map(({ size }) => size));
    Utils.updateBufferAttribute(geometry, 'angle', particles.map(({ angle }) => angle));

    return false;
}