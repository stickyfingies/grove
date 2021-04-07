import { Ray, Vector3 } from 'three';
import $ from 'jquery';
import { ball } from './load';
import { getEntity } from './entities';
import { camera } from './graphics';
import PointerLockControls from './threex/pointerlockControls';

const getShootDir = (targetVec: Vector3) => {
  const playerent = getEntity(0);
  const vector = targetVec;
  targetVec.set(0, 0, 1);
  vector.unproject(camera);
  const ray = new Ray(playerent.body.position, vector.sub(playerent.body.position).normalize());
  targetVec.copy(ray.direction);
};

export default (globals: any, controls: PointerLockControls) => {
  const shoot = () => {
    if (!controls.isLocked) return;

    const b = ball({
      c: 0xFF4500,
    });

    const playerent = getEntity(0);
    let { x: px, y: py, z: pz } = playerent.body.position;
    const { x: vx, y: vy, z: vz } = playerent.body.velocity;

    const shootDirection = new Vector3();
    getShootDir(shootDirection);
    const { x: sdx, y: sdy, z: sdz } = shootDirection;

    const shootVelo = 20;
    b.body.velocity.set(vx + sdx * shootVelo, vy + sdy * shootVelo, vz + sdz * shootVelo);

    px += sdx * 2;
    py += sdy * 2;
    pz += sdz * 2;

    b.body.position.set(px, py, pz);

    const collideCb = () => {
      b.body.removeEventListener('collide', collideCb);
      setTimeout(() => {
        globals.remove.bodies.push(b.body);
        globals.remove.meshes.push(b.mesh);
      }, 1500);
    };

    b.body.addEventListener('collide', collideCb);
  };

  $(document).on('mousedown', shoot);
};
