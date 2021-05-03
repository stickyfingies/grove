import { AmbientLight, DirectionalLight } from 'three';
import { Entity } from '../entities';
import { MeshData } from '../graphics/graphics';
import GameScript from '../script';

export default class LightingScript extends GameScript {
  // eslint-disable-next-line class-methods-use-this
  init() {
    const sunlight = new Entity();
    {
      const light = new DirectionalLight(0xffffff, 1);
      light.position.set(10, 30, 20);
      light.castShadow = true;
      const { shadow } = light;
      shadow.bias = -0.008;
      shadow.camera.near = 1;
      shadow.camera.left = -1024;
      shadow.camera.right = 1024;
      shadow.camera.top = 1024;
      shadow.camera.bottom = -1024;
      shadow.mapSize.width = 1024;
      shadow.mapSize.height = 1024;
      sunlight.setComponent(MeshData, light);
    }

    const ambient = new Entity();
    {
      const light = new AmbientLight(0xffffff, 0.16);
      ambient.setComponent(MeshData, light);
    }
  }
}
