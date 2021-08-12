/**
 * Current Required AIs Include: Wicket, Ferdinand, Nicholas Czerwinski
 *
 * === DEPRECATED ===
 *
 * THIS FILE IS NOT USED ANYMORE - KEPT FOR REFERENCE PURPOSES
 */

// @ts-nocheck

import GameScript from '../script';
import Entity from '../ecs/entity';
import { GraphicsData } from '../graphics/graphics';
import { Physics, PhysicsData } from '../physics';
import { PLAYER_TAG } from './player';

/**
 * Entity Tasks
 */

class RabbitData {
  jumpRadius: number;

  jumpVelocity: number;
}

export default class RabbitScript extends GameScript {
  queries = [RabbitData, PhysicsData];

  init() {
      this.gui.add(this, 'createRabbit').name('Spawn Rabbit');

      for (let i = 0; i < 10; i++) {
          this.createRabbit();
      }
  }

  createRabbit() {
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

      this.assetLoader.loadModel('/models/rabbit-glb/Rabbit.glb', (mesh) => {
          mesh.userData.norotate = true;
          rabbit.setComponent(GraphicsData, mesh);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  update(dt: number, rabbit: Entity) {
      const playerPos = Entity.getTag(PLAYER_TAG).getComponent(PhysicsData).interpolatedPosition;
      const body = rabbit.getComponent(PhysicsData);
      const distanceToPlayer = body.interpolatedPosition.distanceTo(playerPos);

      if (distanceToPlayer < 30) {
          body.wakeUp();
          body.velocity.y = 4;
      }
  }
}
