import { Color, Sprite, SpriteMaterial } from 'three';
import { Entity } from '../entities';
import { GraphicsData } from '../graphics/graphics';
import { Physics, PhysicsData } from '../physics';
import GameScript from '../script';
import { HealthData } from './health';
import { PLAYER_TAG } from './player';

/**
 * Spawns pink items which heal the player for 15 hp each upon contact.
 */
export default class UpgradeScript extends GameScript {
  // eslint-disable-next-line class-methods-use-this
  init() {
    const makeUpgrade = () => {
      const upgrade = new Entity();

      const randomPos = () => Math.random() * 70 - 35;

      const upgradeBody = Physics.makeBall(1000, 1);
      upgradeBody.position.set(randomPos(), 10, randomPos());
      upgrade.setComponent(PhysicsData, upgradeBody);

      const sprite = new Sprite();
      sprite.material = new SpriteMaterial();
      sprite.material.color = new Color(0xff00ff);
      upgrade.setComponent(GraphicsData, sprite);

      const collideCb = ({ body, contact, target }: any) => {
        const player = Entity.getTag(PLAYER_TAG);
        if (body === player.getComponent(PhysicsData)) {
          player.getComponent(HealthData).hp += 15;
          upgradeBody.removeEventListener('collide', collideCb);

          // ! <hack/> physics breaks when deleting upgrade immediately
          // TODO defer entity / component deletion?
          setTimeout(upgrade.delete.bind(upgrade), 40);
        }
      };

      upgradeBody.addEventListener('collide', collideCb);
    };

    for (let i = 0; i < 4; i++) {
      makeUpgrade();
    }
  }
}
