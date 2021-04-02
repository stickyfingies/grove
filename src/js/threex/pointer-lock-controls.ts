"use strict";

import { Euler, Vector3, Object3D } from "three";
import { Vec3, Body } from "cannon-es";

class PointerLockControls {
    camera: Object3D;
    domElement: HTMLElement;
    body: Body;

    isLocked = false;

    readonly #minPolarAngle = 0;
    readonly #maxPolarAngle = Math.PI;
    readonly #velocityFactor = 2;
    readonly #jumpVelocity = 4;

    #moveForward = false;
    #moveBackward = false;
    #moveLeft = false;
    #moveRight = false;
    #canJump = false;

    constructor(camera: Object3D, domElement: HTMLElement, body: Body) {
        this.camera = camera;
        this.domElement = domElement;
        this.body = body;

        this.body.allowSleep = false;

        body.addEventListener("collide", ({ contact }: any) => {
            let contactNormal = new Vec3();
            if (contact.bi.id == body.id)
                contact.ni.negate(contactNormal);
            else
                contactNormal.copy(contact.ni);

            // how "flat" does a surface have to be in order to jump on it
            // 0: can climb sheer cliffs - 1: can only jump on flat plane
            const normalThreshold = 0.64;
            if (contactNormal.dot(new Vec3(0, 1, 0)) > normalThreshold) {
                this.#canJump = true;
            }
        });

        this.connect();
    }

    onPointerlockChange() {
        this.isLocked = (document.pointerLockElement === this.domElement)
    }

    onPointerlockError() { };

    onMouseMove({ movementX, movementY }: MouseEvent) {
        if (!this.isLocked) return;

        let euler = new Euler(0, 0, 0, "YXZ");

        euler.setFromQuaternion(this.camera.quaternion);

        euler.y -= movementX * 0.002;
        euler.x -= movementY * 0.002;

        const PI_2 = Math.PI / 2;
        euler.x = Math.max(PI_2 - this.#maxPolarAngle, Math.min(PI_2 - this.#minPolarAngle, euler.x));

        this.camera.quaternion.setFromEuler(euler);
    }

    onKeyDown({ keyCode }: KeyboardEvent) {
        switch (keyCode) {
            case 38: // up
            case 87: // w
                this.#moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.#moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.#moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.#moveRight = true;
                break;
            case 32: // space
                if (this.#canJump) {
                    this.body.velocity.y += this.#jumpVelocity;
                }
                this.#canJump = false;
                break;
        }
    };

    onKeyUp({ keyCode }: KeyboardEvent) {
        switch (keyCode) {
            case 38: // up
            case 87: // w
                this.#moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.#moveLeft = false;
                break;
            case 40: // down
            case 83: // a
                this.#moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.#moveRight = false;
                break;
        }
    };

    connect() {
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("keydown", (e) => this.onKeyDown(e));
        document.addEventListener("keyup", (e) => this.onKeyUp(e));
        document.addEventListener("pointerlockchange", () => this.onPointerlockChange());
    }

    disconnect() {
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
        document.removeEventListener("pointerlockchange", this.onPointerlockChange);
        document.removeEventListener("pointerlockerror", this.onPointerlockError);
    }

    dispose() {
        this.disconnect();
    }

    update(delta: number) {
        delta *= 0.1;

        let inputVelocity = new Vector3(0, 0, 0);

        if (this.#moveForward) {
            inputVelocity.z = -this.#velocityFactor * delta;
        }
        if (this.#moveBackward) {
            inputVelocity.z = this.#velocityFactor * delta;
        }
        if (this.#moveLeft) {
            inputVelocity.x = -this.#velocityFactor * delta;
        }
        if (this.#moveRight) {
            inputVelocity.x = this.#velocityFactor * delta;
        }

        inputVelocity.applyQuaternion(this.camera.quaternion);

        const clamp = (num: number, a: number, b: number) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

        this.body.velocity.x += inputVelocity.x;
        this.body.velocity.z += inputVelocity.z;
        this.body.velocity.x = clamp(this.body.velocity.x, -inputVelocity.x, inputVelocity.x)
        this.body.velocity.z = clamp(this.body.velocity.z, -inputVelocity.z, inputVelocity.z)

        const { x: px, y: py, z: pz } = this.body.position;
        this.camera.position.copy(new Vector3(px, py, pz));
    }

    getDirection() {
        let direction = new Vector3(0, 0, - 1);
        return (v: Vector3) => v.copy(direction).applyQuaternion(this.camera.quaternion);
    }

    lock() {
        this.domElement.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
    }
};

export { PointerLockControls };