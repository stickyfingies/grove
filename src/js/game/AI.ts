/**
 * Current Required AIs Include: Wicket, Ferdinand, Nicholas Czerwinski
 */

import { Mesh } from 'three';
import { Entity, Task } from '../entities';
import { GraphicsData } from '../graphics';
import { ball, loadModel } from '../load';
import { PhysicsData } from '../physics';

//

class RabbitData {
  jumpRadius: number;

  jumpVelocity: number;
}

const rabbitTask: Task = ([rabbitData, body]: [RabbitData, PhysicsData]) => {
  const player = Entity.getTag('player');
  const distanceToPlayer = body.position.distanceTo(player.getComponent(PhysicsData).position);

  if (distanceToPlayer < 30) {
    body.wakeUp();
    body.velocity.y = 7;
  }
};
rabbitTask.queries = [RabbitData, PhysicsData];

//

const createRabbit = () => {
  const entity = ball({
    radius: 3,
    color: 0xFF4500,
    norotate: true,
  });

  entity.setComponent(RabbitData, {
    jumpRadius: 30,
    jumpVelocity: 7,
  });

  const body = entity.getComponent(PhysicsData);

  loadModel('/models/rabbit-glb/Rabbit.glb', (child: Mesh) => entity.setComponent(GraphicsData, child));

  body.position.x = Math.random() * 600 - 300;
  body.position.y = 50;
  body.position.z = Math.random() * 600 - 300;
};

//

export const init = ({ gui }: any) => {
  gui.add({ createRabbit }, 'createRabbit').name('Spawn Rabbit');

  for (let i = 0; i < 1; i++) {
    createRabbit();
  }
};

export const tasks: Task[] = [rabbitTask];
