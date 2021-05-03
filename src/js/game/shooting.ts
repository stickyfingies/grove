import { Ray, Vector3 } from 'three';
import $ from 'jquery';
import { Entity } from '../entities';
import { Physics, PhysicsData } from '../physics';
import { CameraData, MeshData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import GameScript from '../script';

// shoots a ball outwards from an entity in an indicated direction
export const shoot = (origin: Entity, shootDir: Vector3) => {
  const ball = new Entity();

  const { x: px, y: py, z: pz } = origin.getComponent(PhysicsData).position;
  const { x: vx, y: vy, z: vz } = origin.getComponent(PhysicsData).velocity;
  const { x: sdx, y: sdy, z: sdz } = shootDir;

  const radius = 0.4;
  const mass = 10;
  const shootVelo = 40;

  const body = Physics.makeBall(mass, radius);
  body.velocity.set(vx + sdx * shootVelo, vy + sdy * shootVelo, vz + sdz * shootVelo);
  body.position.set(px + sdx * 5, py + sdy * 5, pz + sdz * 5);
  ball.setComponent(PhysicsData, body);

  const mesh = GraphicsUtils.makeBall(radius);
  ball.setComponent(MeshData, mesh);

  const collideCb = () => {
    body.removeEventListener('collide', collideCb);
    setTimeout(ball.delete.bind(ball), 1500);
  };

  body.addEventListener('collide', collideCb);
};

// get a ThreeJS vector pointing outwards from the camera
export const getCameraDir = () => {
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

export default class ShootingScript extends GameScript {
  init() {
    $(document).on('mousedown', () => {
      if (this.engine.running) shoot(Entity.getTag('player'), getCameraDir());
    });
  }
}
