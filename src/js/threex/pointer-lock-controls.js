"use strict";

import { Euler, EventDispatcher, Vector3 } from "three";
import { Vec3 } from "cannon-es";

class PointerLockControls extends EventDispatcher {
    constructor(camera, domElement, body) {
        super();

        this.camera = camera;
        this.domElement = domElement;
        this.body = body;
        this.isLocked = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;

        //
        // internals
        //

        this.changeEvent = { type: 'change' };
        this.lockEvent = { type: 'lock' };
        this.unlockEvent = { type: 'unlock' };

        this.euler = new Euler(0, 0, 0, 'YXZ');

        this.velocityFactor = 0.3;
        this.jumpVelocity = 10;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        body.addEventListener("collide", (e) => {
            let contact = e.contact;
            let contactNormal = new Vec3();
            if (contact.bi.id == body.id)
                contact.ni.negate(contactNormal);
            else
                contactNormal.copy(contact.ni);

            // how "flat" does a surface have to be in order to jump on it
            // 0: can climb sheer cliffs - 1: can only jump on flat plane
            const normalThreshold = 0.64;
            if (contactNormal.dot(new Vec3(0, 1, 0)) > normalThreshold) {
                this.canJump = true;
            }
        });

        this.connect();
    }

    onPointerlockChange() {
        if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
            this.dispatchEvent(this.lockEvent);
            this.isLocked = true;
        } else {
            this.dispatchEvent(this.unlockEvent);
            this.isLocked = false;
        }
    }

    onPointerlockError() { };

    onMouseMove(event) {
        if (!this.isLocked) return;

        let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        
        this.euler.setFromQuaternion(this.camera.quaternion);

        this.euler.y -= movementX * 0.002;
        this.euler.x -= movementY * 0.002;

        const PI_2 = Math.PI / 2;
        this.euler.x = Math.max(PI_2 - this.maxPolarAngle, Math.min(PI_2 - this.minPolarAngle, this.euler.x));

        this.camera.quaternion.setFromEuler(this.euler);

        this.dispatchEvent(this.changeEvent);
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            case 32: // space
                if (this.canJump) {
                    this.body.velocity.y = this.jumpVelocity;
                }
                this.canJump = false;
                break;
        }
    };

    onKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // a
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
        }
    };

    connect() {
        this.domElement.ownerDocument.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.domElement.ownerDocument.addEventListener('keydown', (e) => this.onKeyDown(e));
        this.domElement.ownerDocument.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.domElement.ownerDocument.addEventListener('pointerlockchange', (e) => this.onPointerlockChange(e));
    }

    disconnect() {
        this.domElement.ownerDocument.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.ownerDocument.removeEventListener('keydown', this.onKeyDown);
        this.domElement.ownerDocument.removeEventListener('keyup', this.onKeyUp);
        this.domElement.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange);
        this.domElement.ownerDocument.removeEventListener('pointerlockerror', this.onPointerlockError);
    }

    dispose() {
        this.disconnect();
    }

    update(delta) {
        delta *= 0.1;

        let inputVelocity = new Vector3(0, 0, 0);

        if (this.moveForward) {
            inputVelocity.z = -this.velocityFactor * delta;
        }
        if (this.moveBackward) {
            inputVelocity.z = this.velocityFactor * delta;
        }
        if (this.moveLeft) {
            inputVelocity.x = -this.velocityFactor * delta;
        }
        if (this.moveRight) {
            inputVelocity.x = this.velocityFactor * delta;
        }

        if (this.canJump) {
            inputVelocity.x *= 0.8;
            inputVelocity.y *= 0.8;
            inputVelocity.z *= 0.8;
        }

        inputVelocity.applyQuaternion(this.camera.quaternion);

        this.body.velocity.x += inputVelocity.x;
        this.body.velocity.z += inputVelocity.z;
        this.camera.position.copy(this.body.position);
    }

    getDirection() {
        let direction = new Vector3(0, 0, - 1);
        return (v) => v.copy(direction).applyQuaternion(camera.quaternion);
    }

    lock() {
        this.domElement.requestPointerLock();
    }

    unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }
};

export { PointerLockControls };