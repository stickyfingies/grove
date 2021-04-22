/**
 * Current Required AIs Include: Wicket, Ferdinand, Nicholas Czerwinski
 *
 * === DEPRECATED ===
 *
 * THIS FILE IS NOT USED ANYMORE - KEPT FOR REFERENCE PURPOSES
 */
// @ts-nocheck

import Engine from '../engine';
import { Entity, Task } from '../entities';
import { MeshData } from '../graphics/graphics';
import { Physics, PhysicsData } from '../physics';

let engine: Engine;

/**
 * Entity Tasks
 */

class RabbitData {
  jumpRadius: number;

  jumpVelocity: number;
}

const rabbitTask: Task = (_, [rabbitData, body]: [RabbitData, PhysicsData]) => {
  const playerPos = Entity.getTag(engine.eManager, 'player').getComponent(PhysicsData).interpolatedPosition;
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
  const rabbit = new Entity(engine.eManager);

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

  engine.assetLoader.loadModel('/models/rabbit-glb/Rabbit.glb', (mesh) => {
    mesh.userData.norotate = true;
    rabbit.setComponent(MeshData, mesh);
  });
};

/**
 * Script Interface
 */

export const init = (engineData: Engine) => {
  engine = engineData;
  engine.gui.add({ createRabbit }, 'createRabbit').name('Spawn Rabbit');

  for (let i = 0; i < 1; i++) {
    createRabbit();
  }
};

export const tasks = [rabbitTask];
