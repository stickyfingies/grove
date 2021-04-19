import {
  Body, Sphere, Material, Vec3,
} from 'cannon-es';
import $ from 'jquery';
import Engine from '../engine';
import { Entity, Task } from '../entities';
import { PhysicsData } from '../physics';
import { KeyboardControlData } from './keyboardControls';

//

let engine: Engine;

/**
 * Entity Tasks
 */

class PlayerData {
  hp: { val: number, max: number };
}

const playerTask: Task = (_, [playerData]: [PlayerData]) => {
  // check for death
  if (playerData.hp.val <= 0) {
    engine.running = false;
    $('#blocker').show();
    $('#load').hide().fadeIn(5000).html('<h1>You Have Perished. Game Over...</h1>');
  }
};
playerTask.queries = new Set([PlayerData]);

/**
 * Script Interface
 */

export const init = (engineData: Engine) => {
  // expose engine data to entire module
  engine = engineData;

  // initialize player stats
  const data: PlayerData = {
    hp: {
      val: 1,
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

    if (contactNormal.dot(upAxis) > 0.5 && body.velocity.y <= -20) {
      const playerdata = Entity.getTag('player').getComponent(PlayerData);
      playerdata.hp.val -= Math.floor(Math.abs(body.velocity.y) / 7);
    }
  });

  // attach data to debug GUI
  const { gui } = engine;
  gui.add(data.hp, 'val').name('HP').listen();
  gui.add(body.position, 'x').listen();
  gui.add(body.position, 'y').listen();
  gui.add(body.position, 'z').listen();

  // register the entity
  new Entity()
    .addTag('player')
    .setComponent(PhysicsData, body)
    .setComponent(PlayerData, data)
    .setComponent(KeyboardControlData, kbControl);
};

export const tasks = [playerTask];
