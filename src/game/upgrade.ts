import {
    Color,
    Sprite,
    SpriteMaterial,
    TextureLoader,
} from 'three';

import Entity from '../ecs/entity';
import { PLAYER_TAG } from './player';
import { PhysicsData } from 'firearm';
import { SpriteData } from '3-AD';
import { graphics, physics, world } from '../engine';

/**
 * Spawns hearts which heal the player for 15 hp each upon contact.
 */
export default class UpgradeScript {
    async init() {
        const upgradeTexture = await new TextureLoader().loadAsync('./img/HealthUpgrade.png');

        const makeUpgrade = async () => {
            const upgrade = new Entity();

            const upgradeBody = physics.createSphere({
                mass: 1000,
                pos: [0, 60, 0],
            }, 0.7);
            upgrade.setComponent(PhysicsData, upgradeBody);

            const sprite = new Sprite();
            sprite.material = new SpriteMaterial();
            sprite.material.color = new Color(0xff00ff);
            sprite.material.map = upgradeTexture;
            graphics.addObjectToScene(sprite);
            upgrade.setComponent(SpriteData, sprite);

            // const collideCb = ({ body }: { body: PhysicsData }) => {
            //     const player = Entity.getTag(PLAYER_TAG);
            //     if (body === player.getComponent(PhysicsData)) {
            //         world.events.emit('healPlayer', 15);
            //         upgradeBody.removeEventListener('collide', collideCb);

            //         // ! physics breaks when deleting upgrade immediately; wait 40ms
            //         // TODO defer entity / component deletion?
            //         setTimeout(upgrade.delete, 40);
            //     }
            // };

            physics.registerCollisionCallback(upgradeBody, (entity) => {
                if (entity === world.getTag(PLAYER_TAG)) {
                    world.events.emit('healPlayer', 15);
                }
            });

            // upgradeBody.addEventListener('collide', collideCb);
        };

        for (let i = 0; i < 4; i++) {
            makeUpgrade();
        }
    }
}
