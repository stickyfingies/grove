import { Vec3 } from 'cannon-es';
import { Euler, Vector3 } from 'three';
import { Entity } from '../entities';
import { CameraData } from '../graphics/graphics';
import { PhysicsData } from '../physics';
import GameScript from '../script';

/**
 * Components
 */

export class KeyboardControlData {
  velocityFactor: number;

  jumpVelocity: number;
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

  readonly minPolarAngle = 0;

  readonly maxPolarAngle = Math.PI;

  queries = new Set([PhysicsData, KeyboardControlData]);

  init() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  update(dt: number, entity: Entity) {
    const body = entity.getComponent(PhysicsData);
    const kb = entity.getComponent(KeyboardControlData);

    const delta = dt * 0.1;
    const inputVelocity = new Vector3(0, 0, 0);

    const raycastDst = new Vec3(body.position.x, body.position.y - 2, body.position.z);
    this.canJump = this.physics.raycast(body.position, raycastDst);

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

    const camera = Entity.getTag(this.eManager, 'camera').getComponent(CameraData);

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

    const camera = Entity.getTag(this.eManager, 'camera').getComponent(CameraData);

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
