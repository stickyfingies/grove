import {
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  CylinderGeometry,
} from 'three';

export default class GraphicsUtils {
  static makeBall(radius: number, norotate?: boolean) {
    const geometry = new SphereGeometry(radius, 32, 32);
    const material = new MeshPhongMaterial({ color: 0x00CCFF });
    const mesh = new Mesh(geometry, material);

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
