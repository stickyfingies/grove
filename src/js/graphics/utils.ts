import {
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereBufferGeometry,
  CylinderBufferGeometry,
} from 'three';
import Entity from '../ecs/entity';

export default class GraphicsUtils {
  static getEntityFromRenderable(object: Object3D) {
    return new Entity(Entity.defaultManager, object.userData.meshId);
  }

  static makeBall(radius: number, norotate?: boolean) {
    const geometry = new SphereBufferGeometry(radius, 32, 32);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);

    mesh.userData.norotate = norotate;

    return mesh;
  }

  static makeCylinder(radius: number, height: number) {
    const geometry = new CylinderBufferGeometry(radius, radius * 0.8, height);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);

    return mesh;
  }

  /**
   * Creates a temporary canvas element and returns its context.
   * @note may leak memory if `canvas` is never deleted (unsure though).
  */
  static scratchCanvasContext(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return { canvas, ctx: canvas.getContext('2d')! };
  }
}
