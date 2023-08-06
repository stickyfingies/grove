import { Euler, Vector3 } from 'three';

import { GameSystem } from '@grove/engine';
import { Movement } from './movement';
import { PhysicsData } from '@grove/physics';
import { CAMERA_TAG, CameraData, MeshData } from '@grove/graphics';
import { events, physics, world } from '@grove/engine';
import { smoothCamera, SmoothCamera } from './smoothCamera';

/**
 * Adding this component to an entity makes its movement controllable via mouse and keyboard
 * @note depends on: `PhysicsData`, `MovementData`
 */
export class KeyboardControls { }

/**
 * Registers mouse/keyboard input events and maps them to a `Movement` component
 */
export default class KeyboardControlScript extends GameSystem {
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

    /** Shift */
    sprint = false;

    /** Minimum look angle, in radians */
    readonly minPolarAngle = 0;

    /** Maximum look angle, in radians */
    readonly maxPolarAngle = Math.PI;

    euler = new Euler(0, 0, 0, 'YXZ');

    initialize() {
        events.on('startLoop', () => {
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
        });

        events.on('stopLoop', () => {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('keydown', this.onKeyDown);
            document.removeEventListener('keyup', this.onKeyUp);
        });
    }

    every_frame(_deltaTime: number) {
        world.executeQuery([PhysicsData, Movement, MeshData], ([body, mvmt, mesh]) => {
            mvmt.direction = new Vector3(0, 0, 0);
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
            mvmt.sprinting = this.sprint;

            const [{ object: camdata, positionStep, quaternionStep, offsetY, offsetZ }] = world.getComponent(smoothCamera, [SmoothCamera]);
            const [camera] = world.getComponent(world.getTag(CAMERA_TAG), [CameraData]);
            mvmt.direction.applyQuaternion(camdata.quaternion);

            // TODO this needs to be done AFTER MovementScript updates
            const [px, py, pz] = physics.getBodyPosition(body);
            camdata.position.copy(new Vector3(px, py + 1, pz));
            camdata.position.y += offsetY;
            camdata.translateZ(offsetZ);

            camera.position.lerp(camdata.position, positionStep);
            camera.quaternion.slerp(camdata.quaternion, quaternionStep);

            mesh.rotation.y = Math.PI + this.euler.y;
        });
    }

    /**
     * @event(window, 'mousemove')
     */
    private onMouseMove({ movementX, movementY }: MouseEvent) {
        const [{ object: camdata }] = world.getComponent(smoothCamera, [SmoothCamera]);
        this.euler.setFromQuaternion(camdata.quaternion);

        const sensitivity = 0.002;
        this.euler.y -= movementX * sensitivity;
        this.euler.x -= movementY * sensitivity;

        const PI_2 = Math.PI / 2;
        this.euler.x = Math.max(PI_2 - this.maxPolarAngle, Math.min(PI_2 - this.minPolarAngle, this.euler.x));

        camdata.quaternion.setFromEuler(this.euler);
    }

    /**
     * @event(window, 'keydown')
     */
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
            case 'Shift':
                this.sprint = true;
                break;
            case 'Escape':
                document.exitPointerLock();
                break;
            case 'Delete':
                location.reload();
                break;
            default:
        }
    }

    /**
     * @event(window, 'keyup')
     */
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
            case 'Shift':
                this.sprint = false;
                break;
            default:
        }
    }
}
