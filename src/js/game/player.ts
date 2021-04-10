import {
  Body, Sphere, Material, Vec3,
} from 'cannon-es';
import $ from 'jquery';
import { Entity, Task } from '../entities';
import { PhysicsData } from '../physics';
import { KeyboardControlData } from '../keyboardControls';

//

let engineData: any;

//

class PlayerData {
  hp: { val: number, max: number };
}

const playerTask: Task = ([playerData]: [PlayerData]) => {
  if (playerData.hp.val <= 0) {
    engineData.running = false;
    $('#blocker').fadeIn(5000);
    $('#load').show().html('<h1>You Have Perished. Game Over...</h1>');
  }
};
playerTask.queries = [PlayerData];

//

export const init = (engine: any) => {
  engineData = engine;

  // stats (hp, etc.)

  const data: PlayerData = {
    hp: {
      val: 10,
      max: 10,
    },
  };

  const kbControl: KeyboardControlData = {
    velocityFactor: 4,
    jumpVelocity: 4,
  };

  // create physics body

  const mass = 1;
  const radius = 1.7;

  const shape = new Sphere(radius);
  const material = new Material('playerMaterial');
  const body = new Body({
    fixedRotation: false,
    allowSleep: false,
    mass,
    material,
  });
  body.addShape(shape);
  body.position.set(0, 30, 0);

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

  // register the entity

  const { gui } = engineData;
  gui.add(data.hp, 'val').name('HP').listen();
  gui.add(body.position, 'x').listen();
  gui.add(body.position, 'y').listen();
  gui.add(body.position, 'z').listen();

  new Entity()
    .addTag('player')
    .setComponent(PhysicsData, body)
    .setComponent(PlayerData, data)
    .setComponent(KeyboardControlData, kbControl);
};

export const tasks: Task[] = [playerTask];
