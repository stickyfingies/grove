/**
 * =============
 * === IDEAS ===
 * =============
 * 
 * - KeyboardControl components receive keyboard events
 * - KeyboardControl<T> class contains mappings from KeyboardEvent -> T
 * - Class listens for event <T> and does behaviors
 */

import { Euler } from 'three';

import { Movement } from './movement';
import { events, world, GameSystem } from '@grove/engine';
import { smoothCamera, SmoothCamera } from './smoothCamera';
import EventEmitter from 'events';

/**
 * @example
 * // Creating a keyboard controller
 * const kbControls = new KeyboardControls({
 *   'w_down': 'MoveForward',
 *   'space_up': 'Jump'
 * });
 * // Receiving useful events
 * kbControls.addListener('Jump', jump);
 */
export class KeyboardControls extends EventEmitter {
    #eventMap = new Map<string, string>(); // kb_event -> T_event
    constructor(eventMapping: Record<string, string[]>) { // T_event -> kb_event[]
        super();
        for (const effect in eventMapping) {
            const keyboardActions = eventMapping[effect];
            for (const kbAction of keyboardActions) {
                console.log(kbAction);
                this.#eventMap.set(kbAction, effect);
            }
        }
    };

    public process_keyboard_event(key: string, type: 'up' | 'down') {
        const eventName = this.#eventMap.get(`${key}_${type}`);
        if (eventName) {
            this.emit(eventName);
        }
    }
}

/**
 * Registers mouse/keyboard input events and maps them to a `Movement` component
 */
export default class KeyboardControlScript extends GameSystem {

    keyState = new Map<string, boolean>();

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

        const pressedKeys: string[] = [];

        for (const [key, pressed] of this.keyState) {
            if (pressed) {
                pressedKeys.push(key);
            }
        }

        // world.executeQuery([KeyboardControls], ([kbControls]) => {
        //     for (const key of pressedKeys) {
        //         console.log(key);
        //         kbControls.process_keyboard_event(key);
        //     }
        // });

        world.executeQuery([Movement], ([mvmt]) => {
            mvmt.moveForward = this.moveForward;
            mvmt.moveBackward = this.moveBackward;
            mvmt.moveLeft = this.moveLeft;
            mvmt.moveRight = this.moveRight;
            mvmt.wantsToJump = this.wantsToJump;
            mvmt.sprinting = this.sprint;
            mvmt.euler = this.euler;
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
    private onKeyDown(e: KeyboardEvent) {

        const { key } = e;

        this.keyState.set(key, true);

        world.executeQuery([KeyboardControls], ([kbControls]) => {
            kbControls.process_keyboard_event(e.key, 'down');
        });

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

        this.keyState.set(key, false);

        world.executeQuery([KeyboardControls], ([kbControls]) => {
            kbControls.process_keyboard_event(key, 'up');
        });

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
