import {
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  CylinderGeometry,
  Object3D,
} from 'three';
import { Entity } from '../entities';

export default class GraphicsUtils {
  static getEntityFromRenderable(object: Object3D) {
    return new Entity(Entity.defaultManager, object.userData.meshId);
  }

  static makeBall(radius: number, norotate?: boolean) {
    const geometry = new SphereGeometry(1, 32, 32);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);

    mesh.scale.set(radius, radius, radius);
    mesh.userData.norotate = norotate;

    return mesh;
  }

  static makeCylinder(radius: number, height: number) {
    const geometry = new CylinderGeometry(radius, radius * 0.8, height);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);

    return mesh;
  }

  // creates a temporary canvas element and returns its context.  may leak memory
  static scratchCanvasContext(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return { canvas, ctx: canvas.getContext('2d')! };
  }
}
