import { Ray, Vector3 } from 'three';
import $ from 'jquery';
import { Entity, EntityManager } from '../entities';
import { Physics, PhysicsData } from '../physics';
import { CameraData, MeshData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { HealthData } from './health';
import GameScript from '../script';

export const shoot = (eManager: EntityManager, origin: Entity, shootDir: Vector3) => {
  const ball = new Entity(eManager);

  const { x: px, y: py, z: pz } = origin.getComponent(PhysicsData).position;
  const { x: vx, y: vy, z: vz } = origin.getComponent(PhysicsData).velocity;
  const { x: sdx, y: sdy, z: sdz } = shootDir;

  const radius = 0.2;
  const mass = 10;
  const shootVelo = 40;

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

export default class ShootingScript extends GameScript {
  init() {
    $(document).on('mousedown', () => {
      if (this.engine.running) shoot(this.eManager, Entity.getTag(this.eManager, 'player'), this.getShootDir());
    });

    // update crosshair with information about what the player is looking at
    $(document).on('mousemove', () => {
      const lookingAt = this.graphics.raycast();
      let text = '';

      if (lookingAt.length && lookingAt[0].distance < 30) {
        const entity = new Entity(this.eManager, lookingAt[0].object.userData.id);
        if (entity.hasComponent(HealthData)) {
          const health = entity.getComponent(HealthData);
          text = `${health.hp.value}/${health.hp.max} hp`;
        }
      }

      $('#crosshair-info').text(text);
    });
  }

  private getShootDir() {
    const camera = Entity.getTag(this.eManager, 'camera').getComponent(CameraData);
    const targetVec = new Vector3(0, 0, 1);
    targetVec.unproject(camera);
    const playerid = Entity.getTag(this.eManager, 'player');
    const { x, y, z } = playerid.getComponent(PhysicsData).position;
    const position = new Vector3(x, y, z);
    const ray = new Ray(position, targetVec.sub(position).normalize());
    targetVec.copy(ray.direction);

    return targetVec;
  }
}
