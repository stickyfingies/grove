import { Ray, Vector3 } from 'three';
import $ from 'jquery';
import { ball } from '../load';
import { Entity } from '../entities';
import { PhysicsData } from '../physics';
import { CameraData } from '../graphics';

const getShootDir = () => {
  const camera = Entity.getTag('camera').getComponent(CameraData);
  const targetVec = new Vector3(0, 0, 1);
  targetVec.unproject(camera);
  const playerid = Entity.getTag('player');
  const { x, y, z } = playerid.getComponent(PhysicsData).position;
  const position = new Vector3(x, y, z);
  const ray = new Ray(position, targetVec.sub(position).normalize());
  targetVec.copy(ray.direction);

  return targetVec;
};

const shoot = () => {
  const entity = ball({
    color: 0xFF4500,
  });
  const body = entity.getComponent(PhysicsData);

  const playerid = Entity.getTag('player');
  let { x: px, y: py, z: pz } = playerid.getComponent(PhysicsData).position;
  const { x: vx, y: vy, z: vz } = playerid.getComponent(PhysicsData).velocity;

  const { x: sdx, y: sdy, z: sdz } = getShootDir();

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

// eslint-disable-next-line import/prefer-default-export
export const init = (engineData: any) => {
  $(document).on('mousedown', () => {
    if (engineData.running) shoot();
  });
};
