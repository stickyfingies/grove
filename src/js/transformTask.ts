import { Quaternion, Vector3 } from 'three';
import { Task } from './entities';
import { GraphicsData } from './graphics';
import { PhysicsData } from './physics';

const transformTask: Task = ([mesh, body]: [GraphicsData, PhysicsData]) => {
  const pos = new Vector3(body.position.x, body.position.y, body.position.z);
  // eslint-disable-next-line max-len
  const quat = new Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
  mesh.position.copy(pos);
  if (!mesh.userData.norotate) mesh.quaternion.copy(quat);
};

transformTask.queries = [GraphicsData, PhysicsData];

export default transformTask;
