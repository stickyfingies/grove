import { Vec3 } from 'cannon-es';
import { Euler, Vector3 } from 'three';
import Engine from '../engine';
import { Entity, Task } from '../entities';
import { CameraData } from '../graphics/graphics';
import { PhysicsData } from '../physics';

/**
 * Script State
 */

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let wantsToJump = false;

let engine: Engine;

const minPolarAngle = 0;
const maxPolarAngle = Math.PI;

/**
 * Entity Tasks
 */

export class KeyboardControlData {
  velocityFactor: number;

  jumpVelocity: number;
}

export const keyboardControlTask: Task = (d, [body, kb]: [PhysicsData, KeyboardControlData]) => {
  const delta = d * 0.1;

  const inputVelocity = new Vector3(0, 0, 0);

  const raycastDst = new Vec3(body.position.x, body.position.y - 2, body.position.z);
  canJump = engine.physics.raycast(body.position, raycastDst);

  if (moveForward) {
    inputVelocity.z = -kb.velocityFactor * delta;
  }
  if (moveBackward) {
    inputVelocity.z = kb.velocityFactor * delta;
  }
  if (moveLeft) {
    inputVelocity.x = -kb.velocityFactor * delta;
  }
  if (moveRight) {
    inputVelocity.x = kb.velocityFactor * delta;
  }
  if (wantsToJump && canJump) {
    body.velocity.y += kb.jumpVelocity;
  }

  const camera = Entity.getTag('camera').getComponent(CameraData);

  inputVelocity.applyQuaternion(camera.quaternion);

  // eslint-disable-next-line max-len
  const clamp = (num: number, a: number, b: number) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

  body.velocity.x += inputVelocity.x;
  body.velocity.z += inputVelocity.z;
  body.velocity.x = clamp(body.velocity.x, -inputVelocity.x, inputVelocity.x);
  body.velocity.z = clamp(body.velocity.z, -inputVelocity.z, inputVelocity.z);

  const { x: px, y: py, z: pz } = body.position;
  camera.position.copy(new Vector3(px, py, pz));
};
keyboardControlTask.queries = new Set([PhysicsData, KeyboardControlData]);

/**
 * Script Specifics
 */

const onMouseMove = ({ movementX, movementY }: MouseEvent) => {
  if (!engine.running) return;

  const euler = new Euler(0, 0, 0, 'YXZ');

  const camera = Entity.getTag('camera').getComponent(CameraData);

  euler.setFromQuaternion(camera.quaternion);

  euler.y -= movementX * 0.002;
  euler.x -= movementY * 0.002;

  const PI_2 = Math.PI / 2;
  euler.x = Math.max(PI_2 - maxPolarAngle, Math.min(PI_2 - minPolarAngle, euler.x));

  camera.quaternion.setFromEuler(euler);
};

const onKeyDown = ({ key }: KeyboardEvent) => {
  switch (key) {
    case 'ArrowUp':
    case 'w':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'a':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 's':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'd':
      moveRight = true;
      break;
    case ' ':
      wantsToJump = true;
      break;
    default:
  }
};

const onKeyUp = ({ key }: KeyboardEvent) => {
  switch (key) {
    case 'ArrowUp':
    case 'w':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'a':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 's':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'd':
      moveRight = false;
      break;
    case ' ':
      wantsToJump = false;
      break;
    default:
  }
};

/**
 * Script Interface
 */

export const init = (engineData: Engine) => {
  engine = engineData;

  document.addEventListener('mousemove', (e) => onMouseMove(e));
  document.addEventListener('keydown', (e) => onKeyDown(e));
  document.addEventListener('keyup', (e) => onKeyUp(e));
};

export const tasks = [keyboardControlTask];
