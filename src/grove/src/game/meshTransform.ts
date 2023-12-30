/**
 * @note setting `mesh.userData.offset: Vector3` allows you to define
 * a desirable offset between the rendured mesh and the physical transform.
 */

import { MeshData, SpriteData } from '@grove/graphics';
import { PhysicsData } from '@grove/physics';
import { Vector3 } from 'three';
import { graphics, physics, world } from '@grove/engine';

/// signature
type S = [PhysicsData, MeshData | SpriteData];

const updateTransform = ([body, mesh]: S, entity: number) => {
    const [px, py, pz] = physics.getBodyPosition(body);
    const offset: Vector3 = mesh.userData.offset ?? new Vector3();
    mesh.position.set(px, py, pz).add(offset);

    // handle when an entity falls off the map
    if (py < -20) {
        world.deleteEntity(entity);
    }

    // @todo - Firearm doesn't sync body quaternions yet
    // const {
    //     x: qx, y: qy, z: qz, w: qw,
    // } = body.quaternion;
    // @todo document `mesh.userData.norotate`
    // if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
};

/**
 * Delta: (-Entity)
 */
world.addRule({
    name: 'Physics affects meshes',
    types: [PhysicsData, MeshData],
    fn: updateTransform
});

/**
 * Delta: (-Entity)
 */
world.addRule({
    name: 'Physics affects sprites',
    types: [PhysicsData, SpriteData],
    fn: updateTransform
});