import { PhysicsData } from "@grove/physics";
import { subtract } from "mathjs";
import { Vector3 } from "three";
import { graphics, physics, world } from "@grove/engine";
import { dealDamage } from "../game/damage.system";
import { shoot } from "../game/shooting";

//
//
//

const HIT_VOLUME = 0.5;

const HIT_AUDIO_PATH = '/audio/hit.mp3';

/**
 * physicsSystem = world.match([Physics]).run_all(() => { ... physics code ... });
 * 
 * attackMechanic = (attackEvent) => morphism(create_ball);
 */

export default class AttackScript {
    timer?: NodeJS.Timer;

    sound = new Audio(HIT_AUDIO_PATH);

    constructor(public entity: number, public target: number) {
        this.sound.volume = HIT_VOLUME;
        this.target = target;
        this.timer = setInterval(() => {
            const [entity_body] = world.get(entity, [PhysicsData]);
            const [target_body] = world.get(this.target, [PhysicsData]);
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
    }

    destroy() { clearInterval(this.timer); }
}