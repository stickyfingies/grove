import { Mesh } from 'three';
import { Entity } from './entities';
import { GraphicsData } from './graphics';
import { ball, loadModel } from './load';
import { PhysicsData } from './physics';

const createRabbit = () => {
  const entity = ball({
    radius: 3,
    color: 0xFF4500,
    norotate: true,
  });
  const body = entity.getComponent(PhysicsData);

  loadModel('/models/rabbit-glb/Rabbit.glb', (child: Mesh) => { entity.setComponent(GraphicsData, child); });

  body.position.x = Math.random() * 600 - 300;
  body.position.y = 50;
  body.position.z = Math.random() * 600 - 300;

  const update = () => {
    const player = Entity.getTag('player');
    const distanceToPlayer = body.position.distanceTo(player.getComponent(PhysicsData).position);

    if (distanceToPlayer < 30) {
      body.wakeUp();
      body.velocity.y = 7;
    }
  };

  setInterval(update, 100);
};

export default () => {
  // Current Required AIs Include: Wicket, Ferdinand, Nicholas Czerwinski

  //

  for (let i = 0; i < 16; i++) {
    createRabbit();
  }
};
