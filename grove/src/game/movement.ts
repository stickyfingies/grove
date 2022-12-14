import { Vector3 } from 'three';

import { Entity } from '@grove/ecs';
import { GameSystem } from '@grove/engine';
import { PhysicsData } from '@grove/physics';
import { physics, world } from '@grove/engine';

export class MovementData {
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

export default class MovementScript extends GameSystem {
    init() {
        world.events.on(`set${MovementData.name}Component`, (id: number, mvmt: MovementData) => {
            const entity = new Entity(Entity.defaultManager, id);
            const body = entity.getComponent(PhysicsData);

            // entity movement depends on physics
            if (!entity.hasComponent(PhysicsData)) throw new Error(`Component ${MovementData.name} must be set after ${PhysicsData.name}`);

            /*
            // update ground info when entity collides with something
            body.addEventListener('collide', ({ contact }: { contact: ContactEquation }) => {
                log('aight');
                const normal = new Vec3();

                // ensure the contact normal is facing outwards from the object, not the player
                if (contact.bi.id === body.id) contact.ni.negate(normal);
                else normal.copy(contact.ni);

                mvmt.groundNormal = new Vector3(normal.x, normal.y, normal.z);
            });
            */
        });
    }

    every_frame() {
        world.executeQuery([PhysicsData, MovementData], ([body, mvmt]) => {
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
