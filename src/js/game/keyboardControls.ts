import { ContactEquation, Vec3 } from 'cannon-es';
import { Euler, MathUtils, Vector3 } from 'three';
import { Entity } from '../entities';
import { CameraData, CAMERA_TAG } from '../graphics/graphics';
import { PhysicsData } from '../physics';
import GameScript from '../script';

// Adding this component to an entity makes its physics body controllable by the mouse and keyboard
export class KeyboardControlData {
  // Speed from pushing arrow keys
  velocityFactor: number;

  // Jumping speed
  jumpVelocity: number;

  // Normal vector of the object this entity is standing on
  hitNormal: Vector3;

  // Angle of the object this entity is standing on, relative to the world up vector (0, 1, 0)
  angle: number;
}

/**
 * Script
 */

export default class KeyboardControlScript extends GameScript {
  moveForward = false;

  moveBackward = false;

  moveLeft = false;

  moveRight = false;

  canJump = false;

  wantsToJump = false;

  // minimum look angle, in radians
  readonly minPolarAngle = 0;

  // maximum look angle, in radians
  readonly maxPolarAngle = Math.PI;

  queries = new Set([PhysicsData, KeyboardControlData]);

  init() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    this.eManager.events.on(`set${KeyboardControlData.name}Component`, (id, kb: KeyboardControlData) => {
      const entity = new Entity(this.eManager, id);
      const body = entity.getComponent(PhysicsData);

      if (!body) console.error(`component ${KeyboardControlData.name} must be set after ${PhysicsData.name}`);

      // update ground info when entity collides with something
      body.addEventListener('collide', ({ contact }: {contact: ContactEquation}) => {
        const normal = new Vec3();

        // ensure the contact normal is facing outwards from the object, not the player
        if (contact.bi.id === body.id) {
          contact.ni.negate(normal);
        } else {
          normal.copy(contact.ni);
        }

        const n = new Vector3(normal.x, normal.y, normal.z);
        const angle = MathUtils.radToDeg(new Vector3(0, 1, 0).angleTo(n));

        kb.hitNormal = n;
        kb.angle = angle;
      });
    });
  }

  update(dt: number, entity: Entity) {
    const body = entity.getComponent(PhysicsData);
    const kb = entity.getComponent(KeyboardControlData);

    const delta = dt * 0.1;
    const inputVelocity = new Vector3(0, 0, 0);

    const raycastDst = new Vec3(body.position.x, body.position.y - 2, body.position.z);
    this.canJump = this.physics.raycast(body.position, raycastDst);

    // apply keyboard input (todo: move this to separate component?)
    if (this.moveForward) {
      inputVelocity.z = -kb.velocityFactor * delta;
    }
    if (this.moveBackward) {
      inputVelocity.z = kb.velocityFactor * delta;
    }
    if (this.moveLeft) {
      inputVelocity.x = -kb.velocityFactor * delta;
    }
    if (this.moveRight) {
      inputVelocity.x = kb.velocityFactor * delta;
    }
    if (this.wantsToJump && this.canJump) {
      body.velocity.y += kb.jumpVelocity;
    }

    // slide down slopes
    const angleFriction = 0.0;
    const maxAngle = 20;
    if (kb.angle > maxAngle) {
      inputVelocity.x += (1 - kb.hitNormal.y) * kb.hitNormal.x * (1 - angleFriction);
      inputVelocity.z += (1 - kb.hitNormal.y) * kb.hitNormal.z * (1 - angleFriction);
    }

    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    inputVelocity.applyQuaternion(camera.quaternion);

    const { max, min } = Math;
    const clamp = (num: number, a: number, b: number) => max(min(num, max(a, b)), min(a, b));

    body.velocity.x += inputVelocity.x;
    body.velocity.z += inputVelocity.z;
    body.velocity.x = clamp(body.velocity.x, -inputVelocity.x, inputVelocity.x);
    body.velocity.z = clamp(body.velocity.z, -inputVelocity.z, inputVelocity.z);

    const { x: px, y: py, z: pz } = body.position;
    camera.position.copy(new Vector3(px, py, pz));
  }

  private onMouseMove({ movementX, movementY }: MouseEvent) {
    if (!this.engine.running) return;

    const euler = new Euler(0, 0, 0, 'YXZ');
    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    euler.setFromQuaternion(camera.quaternion);

    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;

    const PI_2 = Math.PI / 2;
    euler.x = Math.max(PI_2 - this.maxPolarAngle, Math.min(PI_2 - this.minPolarAngle, euler.x));

    camera.quaternion.setFromEuler(euler);
  }

  private onKeyDown({ key }: KeyboardEvent) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'a':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 's':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'd':
        this.moveRight = true;
        break;
      case ' ':
        this.wantsToJump = true;
        break;
      default:
    }
  }

  private onKeyUp({ key }: KeyboardEvent) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'a':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 's':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'd':
        this.moveRight = false;
        break;
      case ' ':
        this.wantsToJump = false;
        break;
      default:
    }
  }
}
