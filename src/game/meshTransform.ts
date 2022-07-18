/**
 * @note setting `Vector3::mesh.userData.offset` allows you to define
 * a desirable offset between the rendured texture and the physical transform.
 */

import EcsView from '../ecs/view';
import GameScript from '../script';
import { MeshData, SpriteData } from '3-AD';
import { PhysicsData } from 'firearm';
import { Vector3 } from 'three';

export default class MeshTransformScript extends GameScript {
    transformView = new EcsView(this.ecs, new Set([MeshData, PhysicsData]));

    update() {
        this.ecs.executeQuery([PhysicsData, MeshData], ([body, mesh], e) => {
            const [px, py, pz] = this.physics.getBodyPosition(body);
            const offset = mesh.userData.offset as Vector3 ?? new Vector3();
            mesh.position.set(px, py, pz).add(offset);

            // @todo - Firearm doesn't sync body quaternions yet
            // const {
            //     x: qx, y: qy, z: qz, w: qw,
            // } = body.quaternion;
            // @todo document `mesh.userData.norotate`
            // if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
        });

        this.ecs.executeQuery([PhysicsData, SpriteData], ([body, mesh], e) => {
            const [px, py, pz] = this.physics.getBodyPosition(body);
            const offset = mesh.userData.offset as Vector3 ?? new Vector3();
            mesh.position.set(px, py, pz).add(offset);

            // @todo - Firearm doesn't sync body quaternions yet
            // const {
            //     x: qx, y: qy, z: qz, w: qw,
            // } = body.quaternion;
            // @todo document `mesh.userData.norotate`
            // if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
        });
    }
}
