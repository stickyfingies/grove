import { Euler, EventDispatcher, Vector3 } from "three";
import { Vec3 } from "cannon-es";

var PointerLockControls = function (camera, domElement, body) {
    this.domElement = domElement;
    this.isLocked = false;

    // Set to constrain the pitch of the camera
    // Range is 0 to Math.PI radians
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    //
    // internals
    //

    var scope = this;

    var changeEvent = { type: 'change' };
    var lockEvent = { type: 'lock' };
    var unlockEvent = { type: 'unlock' };

    var euler = new Euler(0, 0, 0, 'YXZ');

    var PI_2 = Math.PI / 2;

    var vec = new Vector3();

    const velocityFactor = 0.3;
    const jumpVelocity = 10;

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let canJump = false;

    function onMouseMove(event) {
        if (scope.isLocked === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.setFromQuaternion(camera.quaternion);

        euler.y -= movementX * 0.002;
        euler.x -= movementY * 0.002;

        euler.x = Math.max(PI_2 - scope.maxPolarAngle, Math.min(PI_2 - scope.minPolarAngle, euler.x));

        camera.quaternion.setFromEuler(euler);

        scope.dispatchEvent(changeEvent);
    }

    function onPointerlockChange() {
        if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
            scope.dispatchEvent(lockEvent);
            scope.isLocked = true;
        } else {
            scope.dispatchEvent(unlockEvent);
            scope.isLocked = false;
        }
    }

    function onPointerlockError() {
        console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
    }

    let onKeyDown = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if (canJump === true) {
                    body.velocity.y = jumpVelocity;
                }
                canJump = false;
                break;
        }
    };

    let onKeyUp = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // a
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };

    this.connect = function () {
        scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
        scope.domElement.ownerDocument.addEventListener('keydown', onKeyDown);
        scope.domElement.ownerDocument.addEventListener('keyup', onKeyUp);
        scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
        scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);
    };

    this.disconnect = function () {
        scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
        scope.domElement.ownerDocument.removeEventListener('keydown', onKeyDown);
        scope.domElement.ownerDocument.removeEventListener('keyup', onKeyUp);
        scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
        scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);
    };

    this.dispose = function () {
        this.disconnect();
    };

    body.addEventListener("collide", (e) => {
        let contact = e.contact;
        let contactNormal = new Vec3();

        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if (contact.bi.id == body.id)
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni);

        // any value between 0 and 1 -> normal is facing up
        if (contactNormal.dot(new Vec3(0, 1, 0)) > 0.5) {
            canJump = true;
        }
    });

    this.update = function (delta) {
        delta *= 0.1;

        let inputVelocity = new Vector3(0, 0, 0);

        if (moveForward) {
            inputVelocity.z = -velocityFactor * delta;
        }
        if (moveBackward) {
            inputVelocity.z = velocityFactor * delta;
        }
        if (moveLeft) {
            inputVelocity.x = -velocityFactor * delta;
        }
        if (moveRight) {
            inputVelocity.x = velocityFactor * delta;
        }

        if (canJump) {
            inputVelocity.x *= 0.8;
            inputVelocity.y *= 0.8;
            inputVelocity.z *= 0.8;
        }

        inputVelocity.applyQuaternion(camera.quaternion);

        body.velocity.x += inputVelocity.x;
        body.velocity.z += inputVelocity.z;
        camera.position.copy(body.position);
    };

    this.getDirection = function () {
        var direction = new Vector3(0, 0, - 1);

        return function (v) {
            return v.copy(direction).applyQuaternion(camera.quaternion);
        };
    }();

    this.lock = function () {
        this.domElement.requestPointerLock();
    };

    this.unlock = function () {
        scope.domElement.ownerDocument.exitPointerLock();
    };

    this.connect();
};

PointerLockControls.prototype = Object.create(EventDispatcher.prototype);
PointerLockControls.prototype.constructor = PointerLockControls;

export { PointerLockControls };