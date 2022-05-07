import EcsView from '../ecs/view';
import GameScript from '../script';
import { MeshData } from '3-AD';
import { PhysicsData } from 'firearm';

export default class MeshTransformScript extends GameScript {
    transformView = new EcsView(this.ecs, new Set([MeshData, PhysicsData]));

    update() {
        this.ecs.executeQuery([PhysicsData, MeshData], ([body, mesh]) => {
            const [px, py, pz] = this.physics.getBodyPosition(body);
            mesh.position.set(px, py, pz);

            // @todo - Firearm doesn't sync body quaternions yet
            // const {
            //     x: qx, y: qy, z: qz, w: qw,
            // } = body.quaternion;
            // if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
        });
    }
}
