import { Camera, Group, InstancedMesh, Light, Mesh, Object3D, Points, Sprite, Texture } from "three";
import { graphics } from "@grove/engine";

/** Changes the camera to the specified one. camera is a Camera object.   */
export function changeCamera(camera: Camera): void {
    graphics.changeCamera(camera);
}

/** Manually updates material properties of the specified object.
  * object is a Mesh, Points, or Sprite object, and ui is an optional boolean
  * indicating whether the update is for a user interface element. */
export function updateMaterial(object: Mesh | Points | Sprite, ui?: boolean): void {
    graphics.updateMaterial(object, ui);
}

/** Takes a given 3D object and inserts it into the scene.
  * The ONLY WAY to change an object's position is to directly modify its `.position` property. */
export function addObjectToScene(object: Mesh | InstancedMesh | Light | Sprite | Group, ui = false): void {
    graphics.addObjectToScene(object, ui);
}

/**  Removes the specified object and its children from the scene.object is an Object3D object. */
export function removeObjectFromScene(object: Object3D): void {
    graphics.removeObjectFromScene(object);
}

/** Creates a new particle emitter with the specified texture.map is a Texture object. */
export function createParticleEmitter(map: Texture): void {
    graphics.createParticleEmitter(map);
}