import { Euler, Vector3 } from 'three';

import { PhysicsData, Vec3 } from '@grove/physics';
import { physics, world } from '@grove/engine';
import { CAMERA_TAG, CameraData, MeshData } from '@grove/graphics';
import { SmoothCamera, smoothCamera } from './smoothCamera';

export class Movement {

    /** Speed that gets applied for normal movement */
    walkVelocity = 0;

    /** Speed that gets applied in a jump */
    jumpVelocity = 0;

    /** Flag whether the entity wants to jump or not */
    wantsToJump = false;

    /** Flag whether the entity is sprinting */
    sprinting = false;

    /**
     * Normal of surface the entity is standing on
     * @internal
     */
    groundNormal = new Vector3();

    moveForward = false;

    moveBackward = false;

    moveLeft = false;

    moveRight = false;

    euler = new Euler(0, 0, 0, 'YXZ');
}

world.addRule({
    name: 'Movement affects physical objects',
    types: [PhysicsData, MeshData, Movement],
    fn([body, mesh, mvmt]) {
        const direction = new Vector3(0, 0, 0);
        if (mvmt.moveForward) {
            direction.z = -1;
        }
        if (mvmt.moveBackward) {
            direction.z = 1;
        }
        if (mvmt.moveLeft) {
            direction.x = -1;
        }
        if (mvmt.moveRight) {
            direction.x = 1;
        }

        const [{ object: camdata, positionStep, quaternionStep, offsetY, offsetZ }] = world.get(smoothCamera, [SmoothCamera]);
        const [camera] = world.get(world.getTag(CAMERA_TAG), [CameraData]);
        direction.applyQuaternion(camdata.quaternion);

        // walkVector = direction * speed
        const walkVector = direction.normalize();
        walkVector.multiplyScalar(mvmt.walkVelocity);
        walkVector.multiplyScalar(mvmt.sprinting ? 5 : 1);

        // walk
        const walkVelocity: Vec3 = [walkVector.x, 0, walkVector.z];
        physics.addVelocity({ object: body, vector: walkVelocity });

        const position = physics.getBodyPosition(body);

        if (mvmt.wantsToJump) {
            physics.addVelocityConditionalRaycast({
                velocity: {
                    object: body,
                    vector: [0, mvmt.jumpVelocity, 0],
                },
                raycast: {
                    id: 0,
                    from: position,
                    to: [position[0], position[1] - 2.5, position[2]],
                },
            });
        }

        const [px, py, pz] = physics.getBodyPosition(body);
        camdata.position.copy(new Vector3(px, py + 1, pz));
        camdata.position.y += offsetY;
        camdata.translateZ(offsetZ);

        camera.position.lerp(camdata.position, positionStep);
        camera.quaternion.slerp(camdata.quaternion, quaternionStep);

        mesh.rotation.y = Math.PI + mvmt.euler.y;
    }
});
