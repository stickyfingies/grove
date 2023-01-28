import { PhysicsData } from "@grove/physics";
import { subtract } from "mathjs";
import { Vector3 } from "three";
import { graphics, physics, world } from "@grove/engine";
import { dealDamage } from "../game/damage.system";
import { shoot } from "../game/shooting";

export default class AttackScript {
    timer?: NodeJS.Timer;

    static behavior = (target: number) => (id: number) => new AttackScript(id, target);

    constructor(public id: number, public target: number) {
        this.target = target;
        this.timer = setInterval(() => {
            const [entity_body] = world.getComponent(id, [PhysicsData]);
            const [target_body] = world.getComponent(this.target, [PhysicsData]);
            const target_pos = physics.getBodyPosition(target_body);
            const entity_pos = physics.getBodyPosition(entity_body);

            const [x, y, z] = subtract(target_pos, entity_pos);
            const hitCallback = dealDamage(world)(5);
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