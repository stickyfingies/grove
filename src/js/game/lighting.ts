import {
  AmbientLight,
  BackSide,
  BoxBufferGeometry,
  CanvasTexture,
  DirectionalLight,
  ImageBitmapLoader,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import Entity from '../ecs/entity';
import { GraphicsData } from '../graphics/graphics';
import GameScript from '../script';

export default class LightingScript extends GameScript {
  // eslint-disable-next-line class-methods-use-this
  async init() {
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
      sunlight.setComponent(GraphicsData, light);
    }

    const ambient = new Entity();
    {
      const light = new AmbientLight(0xffffff, 0.16);
      ambient.setComponent(GraphicsData, light);
    }

    const skybox = new Entity();

    // skybox state
    const imagePrefix = '/img/skybox/';
    const directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    const imageSuffix = '.jpg';
    const skyGeometry = new BoxBufferGeometry(2000, 2000, 2000);
    const materialArray: MeshBasicMaterial[] = [];

    // initialize image loader
    const loader = new ImageBitmapLoader();

    // load skybox images
    for (let i = 0; i < 6; i++) {
      loader.load(imagePrefix + directions[i] + imageSuffix, (image) => {
        const map = new CanvasTexture(image);
        const mat = new MeshBasicMaterial({
          map,
          side: BackSide,
          fog: false,
        });
        materialArray[i] = mat;
      });
    }

    // create skybox
    const skyboxMesh = new Mesh(skyGeometry, materialArray);
    setTimeout(() => skybox.setComponent(GraphicsData, skyboxMesh), 100);
  }
}
