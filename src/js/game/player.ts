import {
  Body, Sphere, Material, Vec3,
} from 'cannon-es';
import $ from 'jquery';
import Engine from '../engine';
import { eManager, Entity } from '../entities';
import { PhysicsData } from '../physics';
import { HealthData } from './health';
import { KeyboardControlData } from './keyboardControls';

/**
 * Script Interface
 */

// eslint-disable-next-line import/prefer-default-export
export const init = (engine: Engine) => {
  const health: HealthData = {
    hp: {
      value: 5,
      max: 10,
    },
  };

  // initialize KB control options
  const kbControl: KeyboardControlData = {
    velocityFactor: 4,
    jumpVelocity: 1.5,
  };

  // create physics body
  const mass = 1;
  const radius = 1.7;
  const shape = new Sphere(radius);
  const material = new Material('playerMaterial');
  const body = new Body({
    collisionFilterGroup: 2,
    allowSleep: false,
    mass,
    material,
  });
  body.addShape(shape);
  // body.position.set(0, 30, 0);

  // handle fall damage
  body.addEventListener('collide', ({ contact }: any) => {
    const upAxis = new Vec3(0, 1, 0);
    const contactNormal = new Vec3();

    if (contact.bi.id === body.id) {
      contact.ni.negate(contactNormal);
    } else {
      contactNormal.copy(contact.ni);
    }

    if (contactNormal.dot(upAxis) > 0.5 && body.velocity.length() >= 15) {
      health.hp.value -= Math.floor(Math.abs(body.velocity.length()) / 10);
    }
  });

  // handle death
  eManager.events.on(`delete${HealthData.name}Component`, (id) => {
    if (id === Entity.getTag('player').id) {
      $('#blocker').show();
      $('#load').hide().fadeIn(5000).html('<h1>You Have Perished. Game Over...</h1>');
    }
  });

  // attach data to debug GUI
  const { gui } = engine;
  gui.add(health.hp, 'value').name('HP').listen();
  gui.add(body.position, 'x').listen();
  gui.add(body.position, 'y').listen();
  gui.add(body.position, 'z').listen();

  // register the entity
  new Entity()
    .addTag('player')
    .setComponent(PhysicsData, body)
    .setComponent(HealthData, health)
    .setComponent(KeyboardControlData, kbControl);
};
