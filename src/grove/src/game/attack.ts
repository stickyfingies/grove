import { PhysicsData } from "@grove/physics";
import { subtract } from "mathjs";
import { Vector3 } from "three";
import { graphics, physics, world } from "@grove/engine";
import { dealDamage } from "./damage.system";
import { shoot } from "./shooting";

const HIT_AUDIO_PATH = 'audio/hit.mp3';

export class Attacker {

    constructor(public target: number) {}

    timer?: NodeJS.Timer;
    sound = new Audio(HIT_AUDIO_PATH);
}

/**
 * Delta: (+Entity)
 */
world.useEffect({
    type: Attacker,

    add(entity, attacker) {
        attacker.timer = setInterval(() => {
            const [entity_body] = world.get(entity, [PhysicsData]);
            const [target_body] = world.get(attacker.target, [PhysicsData]);
            const target_pos = physics.getBodyPosition(target_body);
            const entity_pos = physics.getBodyPosition(entity_body);

            const [x, y, z] = subtract(target_pos, entity_pos);
            const hitCallback = () => {
                // this.sound.currentTime = 0;
                // this.sound.play();
                return dealDamage(world)(5);
            };
            shoot(
                physics,
                graphics,
                new Vector3().fromArray(entity_pos),
                new Vector3(x, y, z),
                hitCallback,
            );
        }, 1000);
    },

    remove(entity, attacker) {
        clearInterval(attacker.timer);
    }
});