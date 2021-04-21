import { Quaternion, Vector3 } from 'three';
import { Task } from '../entities';
import { MeshData, SpriteData } from '../graphics/graphics';
import { PhysicsData } from '../physics';

/**
 * Entity Tasks
 */

const updateMeshTransforms: Task = (_, [mesh, body]: [MeshData, PhysicsData]) => {
  const { x: px, y: py, z: pz } = body.interpolatedPosition;
  const {
    x: qx, y: qy, z: qz, w: qw,
  } = body.interpolatedQuaternion;

  mesh.position.set(px, py, pz);
  if (!mesh.userData.norotate) mesh.quaternion.set(qx, qy, qz, qw);
};
updateMeshTransforms.queries = new Set([MeshData, PhysicsData]);

//

const updateSpriteTransforms: Task = (_, [sprite, body]: [SpriteData, PhysicsData]) => {
  const { x: px, y: py, z: pz } = body.interpolatedPosition;
  const {
    x: qx, y: qy, z: qz, w: qw,
  } = body.interpolatedQuaternion;

  sprite.position.copy(new Vector3(px, py, pz));
  if (!sprite.userData.norotate) sprite.quaternion.copy(new Quaternion(qx, qy, qz, qw));
};
updateSpriteTransforms.queries = new Set([SpriteData, PhysicsData]);

/**
 * Script Interface
 */

// eslint-disable-next-line import/prefer-default-export
export const tasks = [updateMeshTransforms, updateSpriteTransforms];
