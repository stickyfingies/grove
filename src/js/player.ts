/* eslint-disable max-classes-per-file */
import {
  Body, Sphere, Material, Vec3,
} from 'cannon-es';
import $ from 'jquery';
import { Entity, System } from './entities';
import { PhysicsData } from './physics';

export class PlayerData {
  hp: { val: number, max: number };
}

class PlayerSystem implements System {
  queries = [PlayerData];

  // eslint-disable-next-line class-methods-use-this
  update([playerData]: [PlayerData]) {
    if (playerData.hp.val <= 0) {
      $('#blocker').fadeIn(5000);
      $('#load').show().html('<h1>You Have Perished. Game Over...</h1>');
    }
  }
}

export const playerSystem = new PlayerSystem();

export const initPlayer = () => {
  const data: PlayerData = {
    hp: {
      val: 10,
      max: 10,
    },
  };

  // create physical representation

  const mass = 1;
  const radius = 1.7;

  const shape = new Sphere(radius);
  const material = new Material('playerMaterial');
  const body = new Body({
    mass,
    material,
  });
  body.addShape(shape);
  body.position.set(0, 30, 0);
  body.fixedRotation = true;
  // body.linearDamping = 0.9;

  body.addEventListener('collide', ({ contact }: any) => {
    const upAxis = new Vec3(0, 1, 0);
    const contactNormal = new Vec3();

    if (contact.bi.id === body.id) {
      contact.ni.negate(contactNormal);
    } else {
      contactNormal.copy(contact.ni);
    }

    if (contactNormal.dot(upAxis) > 0.5 && body.velocity.y <= -20) {
      const playerdata = Entity.getTag('player').getComponent(PlayerData);
      playerdata.hp.val -= Math.floor(Math.abs(body.velocity.y) / 7);
      console.log(playerdata.hp.val);
    }
  });

  // register the entity

  new Entity()
    .addTag('player')
    .setComponent(PhysicsData, body)
    .setComponent(PlayerData, data);
};
