import { ContactEquation, Vec3 } from 'cannon-es';
import { MathUtils, Vector3 } from 'three';
import Entity from '../ecs/entity';
import EcsView from '../ecs/view';
import { PhysicsData } from '../physics';
import GameScript from '../script';

export class MovementData {
  /** Direction the entity should walk */
  direction = new Vector3();

  /** Speed that gets applied for normal movement */
  walkVelocity: number;

  /** Speed that gets applied in a jump */
  jumpVelocity: number;

  /** Flag whether the entity wants to jump or not */
  wantsToJump = false;

  /**
   * Normal of surface the entity is standing on
   * @internal
   */
  groundNormal = new Vector3();

  constructor(walkVelocity: number, jumpVelocity: number) {
    this.walkVelocity = walkVelocity;
    this.jumpVelocity = jumpVelocity;
  }
}

export default class MovementScript extends GameScript {
  movementView = new EcsView(this.ecs, new Set([MovementData, PhysicsData]));

  init() {
    this.ecs.events.on(`set${MovementData.name}Component`, (id: number, mvmt: MovementData) => {
      const entity = new Entity(Entity.defaultManager, id);
      const body = entity.getComponent(PhysicsData);

      // entity movement depends on physics
      if (!entity.hasComponent(PhysicsData)) console.error(`component ${MovementData.name} must be set after ${PhysicsData.name}`);

      // update ground info when entity collides with something
      body.addEventListener('collide', ({ contact }: {contact: ContactEquation}) => {
        const normal = new Vec3();

        // ensure the contact normal is facing outwards from the object, not the player
        if (contact.bi.id === body.id) {
          contact.ni.negate(normal);
        } else {
          normal.copy(contact.ni);
        }

        mvmt.groundNormal = new Vector3(normal.x, normal.y, normal.z);
      });
    });
  }

  update(dt: number) {
    this.movementView.iterateView((entity) => {
      const body = entity.getComponent(PhysicsData);
      const mvmt = entity.getComponent(MovementData);

      // walkVector = direction * speed
      const walkVector = mvmt.direction.normalize();
      walkVector.multiplyScalar(mvmt.walkVelocity);

      // slide down slopes
      const angleFriction = 0.0;
      const maxAngle = 20;
      const groundAngle = MathUtils.radToDeg(new Vector3(0, 1, 0).angleTo(mvmt.groundNormal));
      if (groundAngle > maxAngle) {
        walkVector.x += (1 - mvmt.groundNormal.y) * mvmt.groundNormal.x * (1 - angleFriction);
        walkVector.z += (1 - mvmt.groundNormal.y) * mvmt.groundNormal.z * (1 - angleFriction);
      }

      // walk
      body.velocity.x += walkVector.x;
      body.velocity.z += walkVector.z;

      const { max, min } = Math;
      const clamp = (num: number, a: number, b: number) => max(min(num, max(a, b)), min(a, b));

      // restrict speed
      body.velocity.x = clamp(body.velocity.x, -walkVector.x, walkVector.x);
      body.velocity.z = clamp(body.velocity.z, -walkVector.z, walkVector.z);

      // try to jump
      if (mvmt.wantsToJump) {
        const raycastDst = new Vec3(body.position.x, body.position.y - 2, body.position.z);
        const canJump = this.physics.raycast(body.position, raycastDst);

        if (canJump) body.velocity.y += mvmt.jumpVelocity;
      }
    });
  }
}
