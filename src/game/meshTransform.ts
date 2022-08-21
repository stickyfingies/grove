/**
 * @note setting `Vector3::mesh.userData.offset` allows you to define
 * a desirable offset between the rendured texture and the physical transform.
 */

import { MeshData, SpriteData } from '3-AD';
import { PhysicsData } from 'firearm';
import { Vector3 } from 'three';
import { EngineSystem, graphics, physics, world } from '../engine';

/// signature
type S = [PhysicsData, MeshData | SpriteData];

export default class MeshTransformScript {
    every_frame() {
        const updateTransform = ([body, mesh]: S, entity: number) => {
            const [px, py, pz] = physics.getBodyPosition(body);
            const offset: Vector3 = mesh.userData.offset ?? new Vector3();
            mesh.position.set(px, py, pz).add(offset);

            // handle when an entity falls off the map
            if (py < -20) {
                physics.removeBody(body);
                graphics.removeObjectFromScene(mesh);
                world.deleteEntity(entity);
            }

            // @todo - Firearm doesn't sync body quaternions yet
            // const {
            //     x: qx, y: qy, z: qz, w: qw,
            // } = body.quaternion;
            // @todo document `mesh.userData.norotate`
            // if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
        }

        world.executeQuery([PhysicsData, MeshData], updateTransform);
        world.executeQuery([PhysicsData, SpriteData], updateTransform);
    }
}

export class TransformSystem extends EngineSystem {
    update() {
        //
    }
}