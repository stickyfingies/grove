import EcsView from '../ecs/view';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import { PhysicsData } from '../physics';

export default class MeshTransformScript extends GameScript {
    transformView = new EcsView(this.ecs, new Set([GraphicsData, PhysicsData]));

    update(dt: number) {
        this.transformView.iterateView((entity) => {
            const body = entity.getComponent(PhysicsData);
            const mesh = entity.getComponent(GraphicsData);

            const { x: px, y: py, z: pz } = body.position;
            const {
                x: qx, y: qy, z: qz, w: qw,
            } = body.quaternion;

            mesh.position.set(px, py, pz);

            if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
        });
    }
}
