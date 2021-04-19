import { Quaternion, Vector3 } from 'three';
import { Task } from '../entities';
import { GraphicsData } from '../graphics';
import { PhysicsData } from '../physics';

/**
 * Entity Tasks
 */

const updateTransforms: Task = (_, [mesh, body]: [GraphicsData, PhysicsData]) => {
  const { x: px, y: py, z: pz } = body.interpolatedPosition;
  const {
    x: qx, y: qy, z: qz, w: qw,
  } = body.interpolatedQuaternion;

  mesh.position.copy(new Vector3(px, py, pz));
  if (!mesh.userData.norotate) mesh.quaternion.copy(new Quaternion(qx, qy, qz, qw));
};

updateTransforms.queries = new Set([GraphicsData, PhysicsData]);

/**
 * Script Interface
 */

// eslint-disable-next-line import/prefer-default-export
export const tasks = [updateTransforms];
