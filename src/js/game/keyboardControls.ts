import { Euler, Vector3 } from 'three';
import { Entity } from '../entities';
import { CameraData, CAMERA_TAG } from '../graphics/graphics';
import { PhysicsData } from '../physics';
import GameScript from '../script';
import { MovementData } from './movement';

/**
 * Adding this component to an entity makes its physics body controllable via mouse and keyboard
 * @note depends on PhysicsData
 */
export class KeyboardControlData {}

/**
 * Registers mouse/keyboard movements and applies them to every entity with `KeyboardControlData`
 *
 * Currently, this script reads input events and records them into movement commands, and then
 * immediately applies those commands to move an entity's physics body.  It may be beneficial to
 * separate this script into two separate systems - an input system, and a movement system.  That
 * way, game entities could be effected by the movement component irregardless of the source of the
 * movement - i.e. the player's moevement compoenent is updated via mouse & keyboard, an a.i.'s
 * movement component could be updated via an a.i. script, etc.
 *
 * tl;dr
 * TODO - generalize entity movement
 */
export default class KeyboardControlScript extends GameScript {
  /** W, UpArrow */
  moveForward = false;

  /** S, DownArrow */
  moveBackward = false;

  /** A, LeftArrow */
  moveLeft = false;

  /** D, RightArrow */
  moveRight = false;

  /** SpaceBar */
  wantsToJump = false;

  /** Minimum look angle, in radians */
  readonly minPolarAngle = 0;

  /** Maximum look angle, in radians */
  readonly maxPolarAngle = Math.PI;

  queries = new Set([PhysicsData, MovementData, KeyboardControlData]);

  init() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  update(dt: number, entity: Entity) {
    const body = entity.getComponent(PhysicsData);
    const mvmt = entity.getComponent(MovementData);

    mvmt.direction = new Vector3(0, 0, 0);

    // apply keyboard input
    // ? should this go into its own `movement` component (would allow AI movement)?
    if (this.moveForward) {
      mvmt.direction.z = -1;
    }
    if (this.moveBackward) {
      mvmt.direction.z = 1;
    }
    if (this.moveLeft) {
      mvmt.direction.x = -1;
    }
    if (this.moveRight) {
      mvmt.direction.x = 1;
    }

    mvmt.wantsToJump = this.wantsToJump;

    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    mvmt.direction.applyQuaternion(camera.quaternion);

    // todo this needs to be done AFTER MovementScript updates
    const { x: px, y: py, z: pz } = body.position;
    camera.position.copy(new Vector3(px, py, pz));
  }

  // ? should this go into a separate input system?
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

  // ? should this go into a separate input system?
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

  // ? should this go into a separate input system?
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
