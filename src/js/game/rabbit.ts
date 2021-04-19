/**
 * Current Required AIs Include: Wicket, Ferdinand, Nicholas Czerwinski
 */

import { Mesh } from 'three';
import Engine from '../engine';
import { Entity, Task } from '../entities';
import { GraphicsData } from '../graphics';
import AssetLoader from '../load';
import { Physics, PhysicsData } from '../physics';

let assetLoader: AssetLoader;

/**
 * Entity Tasks
 */

class RabbitData {
  jumpRadius: number;

  jumpVelocity: number;
}

const rabbitTask: Task = (_, [rabbitData, body]: [RabbitData, PhysicsData]) => {
  const playerPos = Entity.getTag('player').getComponent(PhysicsData).interpolatedPosition;
  const distanceToPlayer = body.interpolatedPosition.distanceTo(playerPos);

  if (distanceToPlayer < rabbitData.jumpRadius) {
    body.wakeUp();
    // body.velocity.y = rabbitData.jumpVelocity;
  }
};
rabbitTask.queries = new Set([RabbitData, PhysicsData]);

/**
 * Script Specifics
 */

const createRabbit = () => {
  const rabbit = new Entity();

  const radius = 100;
  const mass = 3;
  const body = Physics.makeBall(radius, mass);
  body.position.x = Math.random() * 150 - 75;
  body.position.y = 30;
  body.position.z = Math.random() * 150 - 75;
  rabbit.setComponent(PhysicsData, body);

  rabbit.setComponent(RabbitData, {
    jumpRadius: 30,
    jumpVelocity: 7,
  });

  assetLoader.loadModel('/models/rabbit-glb/Rabbit.glb', (child: Mesh) => rabbit.setComponent(GraphicsData, child));
};

/**
 * Script Interface
 */

export const init = ({ gui, assetLoader: al }: Engine) => {
  assetLoader = al;
  gui.add({ createRabbit }, 'createRabbit').name('Spawn Rabbit');

  for (let i = 0; i < 1; i++) {
    createRabbit();
  }
};

export const tasks = [rabbitTask];
