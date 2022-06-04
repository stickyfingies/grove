import { Vector3 } from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { PhysicsData } from 'firearm';

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

export default class MovementScript extends GameScript {
    init() {
        this.ecs.events.on(`set${MovementData.name}Component`, (id: number, mvmt: MovementData) => {
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

    update() {
        this.ecs.executeQuery([PhysicsData, MovementData], ([body, mvmt]) => {
            // walkVector = direction * speed
            const walkVector = mvmt.direction.normalize();
            walkVector.multiplyScalar(mvmt.walkVelocity);
            walkVector.multiplyScalar(mvmt.sprinting ? 5 : 1);

            // walk
            const walkVelocity = [walkVector.x, 0, walkVector.z];
            this.physics.addVelocity(body, walkVelocity);

            const position = this.physics.getBodyPosition(body);

            // try to jump
            // if (mvmt.wantsToJump) {
            //     const raycastDst =
            // new Vec3(body.position.x, body.position.y - 2, body.position.z);
            //     const canJump = this.physics.raycast(body.position, raycastDst);

            //     if (canJump) body.velocity.y += mvmt.jumpVelocity;
            // }
            if (mvmt.wantsToJump) {
                this.physics.addVelocityConditionalRaycast(
                    body,
                    [0, mvmt.jumpVelocity, 0],
                    position,
                    [position[0], position[1] - 1.5, position[2]],
                );
            }
        });
    }
}
