import {
    Color, Sprite, SpriteMaterial, TextureLoader,
} from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import { PLAYER_TAG } from './player';
import { Physics, PhysicsData } from '../physics';

/**
 * Spawns pink items which heal the player for 15 hp each upon contact.
 */
export default class UpgradeScript extends GameScript {
    // eslint-disable-next-line class-methods-use-this
    init() {
        const makeUpgrade = async () => {
            const upgrade = new Entity();

            const randomPos = () => Math.random() * 70 - 35;

            const upgradeBody = Physics.makeBall(1000, 1);
            upgradeBody.position.set(randomPos(), 10, randomPos());
            upgrade.setComponent(PhysicsData, upgradeBody);

            const sprite = new Sprite();
            sprite.material = new SpriteMaterial();
            sprite.material.color = new Color(0xff00ff);
            sprite.material.map = await new TextureLoader().loadAsync('/img/HealthUpgrade.png');
            upgrade.setComponent(GraphicsData, sprite);

            const collideCb = ({ body }: { body: PhysicsData }) => {
                const player = Entity.getTag(PLAYER_TAG);
                if (body === player.getComponent(PhysicsData)) {
                    this.ecs.events.emit('healPlayer', 15);
                    upgradeBody.removeEventListener('collide', collideCb);

                    // ! physics breaks when deleting upgrade immediately; wait 40ms
                    // TODO defer entity / component deletion?
                    setTimeout(upgrade.delete, 40);
                }
            };

            upgradeBody.addEventListener('collide', collideCb);
        };

        for (let i = 0; i < 4; i++) {
            makeUpgrade();
        }
    }
}
