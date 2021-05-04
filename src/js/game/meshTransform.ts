import { Entity } from '../entities';
import { GraphicsData } from '../graphics/graphics';
import { PhysicsData } from '../physics';
import GameScript from '../script';

export default class MeshTransformScript extends GameScript {
  queries = new Set([GraphicsData, PhysicsData])

  // eslint-disable-next-line class-methods-use-this
  update(dt: number, entity: Entity) {
    const body = entity.getComponent(PhysicsData);
    const mesh = entity.getComponent(GraphicsData);

    const { x: px, y: py, z: pz } = body.interpolatedPosition;
    const {
      x: qx, y: qy, z: qz, w: qw,
    } = body.interpolatedQuaternion;

    mesh.position.set(px, py, pz);
    if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
  }
}
