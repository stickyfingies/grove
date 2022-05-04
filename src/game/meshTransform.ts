import EcsView from '../ecs/view';
import GameScript from '../script';
import { MeshData } from '3-AD';
import { PhysicsData } from 'firearm';

export default class MeshTransformScript extends GameScript {
    transformView = new EcsView(this.ecs, new Set([MeshData, PhysicsData]));

    update(dt: number) {
        this.ecs.executeQuery([PhysicsData, MeshData], ([body, mesh]) => {
            const { x: px, y: py, z: pz } = body.position;
            const {
                x: qx, y: qy, z: qz, w: qw,
            } = body.quaternion;

            mesh.position.set(px, py, pz);

            if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
        });
    }
}
