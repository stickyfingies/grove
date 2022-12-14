import { CameraData, CAMERA_TAG } from '@grove/graphics';
import { Object3D } from "three";
import { world } from "@grove/engine";

export class SmoothCameraData {
    object = new Object3D();
    positionStep = 0.1;
    quaternionStep = 0.2;
    offsetY = 2.5;
    offsetZ = 10;

    constructor() {
        const { position, quaternion } = world.getComponent(world.getTag(CAMERA_TAG), CameraData);
        this.object.position.copy(position.clone());
        this.object.quaternion.copy(quaternion.clone());
    }
}

export const smoothCamera = world.createEntity();
world.setComponent(smoothCamera, SmoothCameraData, new SmoothCameraData());