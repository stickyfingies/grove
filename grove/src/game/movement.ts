import { Vector3 } from 'three';

import { GameSystem } from '@grove/engine';
import { PhysicsData } from '@grove/physics';
import { physics, world } from '@grove/engine';

export class Movement {
    /** Direction the entity should walk */
    direction = new Vector3();

    /** Speed that gets applied for normal movement */
    walkVelocity = 0;

    /** Speed that gets applied in a jump */
    jumpVelocity = 0;

    /** Flag whether the entity wants to jump or not */
    wantsToJump = false;

    /** Flag whether the entity is sprinting */
    sprinting = false;

    /**
     * Normal of surface the entity is standing on
     * @internal
     */
    groundNormal = new Vector3();
}

function DefineTask(...args: any) {
    // Data.set(entity, [Foo], [{ a: 3 }]);
}

DefineTask([PhysicsData, Movement], ([body, mvmt]: any) => {
    body.foo;
    mvmt.bar;
});

/**
 * Uses physics API
 * Uses movement data
 * Uses physics data
 */
export default class MovementScript extends GameSystem {
    every_frame() {
        world.executeQuery([PhysicsData, Movement], ([body, mvmt]) => {
            // walkVector = direction * speed
            const walkVector = mvmt.direction.normalize();
            walkVector.multiplyScalar(mvmt.walkVelocity);
            walkVector.multiplyScalar(mvmt.sprinting ? 5 : 1);

            // walk
            const walkVelocity = [walkVector.x, 0, walkVector.z];
            physics.addVelocity(body, walkVelocity);

            const position = physics.getBodyPosition(body);

            if (mvmt.wantsToJump) {
                physics.addVelocityConditionalRaycast(
                    body,
                    [0, mvmt.jumpVelocity, 0],
                    position,
                    [position[0], position[1] - 2.5, position[2]],
                );
            }
        });
    }
}
