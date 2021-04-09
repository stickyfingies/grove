import { Ray, Vector3 } from 'three';
import $ from 'jquery';
import { ball } from './load';
import { Entity } from './entities';
import { camera } from './graphics';
import PointerLockControls from './threex/pointerlockControls';
import { PhysicsData } from './physics';

const getShootDir = (targetVec: Vector3) => {
  const vector = targetVec;
  targetVec.set(0, 0, 1);
  vector.unproject(camera);
  const playerid = Entity.getTag('player');
  const { x, y, z } = playerid.getComponent(PhysicsData).position;
  const position = new Vector3(x, y, z);
  const ray = new Ray(position, vector.sub(position).normalize());
  targetVec.copy(ray.direction);
};

export default (controls: PointerLockControls) => {
  const shoot = () => {
    if (!controls.isLocked) return;

    const entity = ball({
      color: 0xFF4500,
    });
    const body = entity.getComponent(PhysicsData);

    const playerid = Entity.getTag('player');
    let { x: px, y: py, z: pz } = playerid.getComponent(PhysicsData).position;
    const { x: vx, y: vy, z: vz } = playerid.getComponent(PhysicsData).velocity;

    const shootDirection = new Vector3();
    getShootDir(shootDirection);
    const { x: sdx, y: sdy, z: sdz } = shootDirection;

    const shootVelo = 20;
    body.velocity.set(vx + sdx * shootVelo, vy + sdy * shootVelo, vz + sdz * shootVelo);

    px += sdx * 2;
    py += sdy * 2;
    pz += sdz * 2;

    body.position.set(px, py, pz);

    const collideCb = () => {
      body.removeEventListener('collide', collideCb);
      setTimeout(() => {
        entity.delete();
      }, 1500);
    };

    body.addEventListener('collide', collideCb);
  };

  $(document).on('mousedown', shoot);
};
