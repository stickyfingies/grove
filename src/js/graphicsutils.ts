import { Mesh, MeshPhongMaterial, SphereGeometry } from 'three';

export default class GraphicsUtils {
  static makeBall(radius: number, norotate?: boolean) {
    const geometry = new SphereGeometry(radius, 32, 32);
    const mesh = new Mesh(geometry, new MeshPhongMaterial({
      color: 0x00CCFF,
    }));
    mesh.userData.norotate = norotate;

    return mesh;
  }
}
