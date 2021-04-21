import { Ray, Vector3 } from 'three';
import $ from 'jquery';
import { Entity } from '../entities';
import { Physics, PhysicsData } from '../physics';
import { CameraData, MeshData } from '../graphics/graphics';
import Engine from '../engine';
import GraphicsUtils from '../graphics/utils';
import { HealthData } from './health';

/**
 * Script Specifics
 */

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
  const ball = new Entity();
  const playerid = Entity.getTag('player');

  const { x: px, y: py, z: pz } = playerid.getComponent(PhysicsData).position;
  const { x: vx, y: vy, z: vz } = playerid.getComponent(PhysicsData).velocity;
  const { x: sdx, y: sdy, z: sdz } = getShootDir();

  const radius = 0.2;
  const mass = 10;
  const shootVelo = 20;

  const body = Physics.makeBall(mass, radius);
  body.velocity.set(vx + sdx * shootVelo, vy + sdy * shootVelo, vz + sdz * shootVelo);
  body.position.set(px + sdx * 2, py + sdy * 2, pz + sdz * 2);
  ball.setComponent(PhysicsData, body);

  const mesh = GraphicsUtils.makeBall(radius);
  ball.setComponent(MeshData, mesh);

  const collideCb = () => {
    body.removeEventListener('collide', collideCb);
    setTimeout(() => ball.delete(), 1500);
  };

  body.addEventListener('collide', collideCb);
};

/**
 * Script Interface
 */

// eslint-disable-next-line import/prefer-default-export
export const init = (engine: Engine) => {
  $(document).on('mousedown', () => {
    if (engine.running) shoot();
  });

  // update crosshair with information about what the player is looking at
  $(document).on('mousemove', () => {
    const lookingAt = engine.graphics.raycast();
    let text = '';

    if (lookingAt.length && lookingAt[0].distance < 30) {
      const e = new Entity(lookingAt[0].object.userData.id);
      if (e.hasComponent(HealthData)) {
        const health = e.getComponent(HealthData);
        text = `${health.hp.value}/${health.hp.max} hp`;
      }
    }

    $('#crosshair-info').text(text);
  });
};
