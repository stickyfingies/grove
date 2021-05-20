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
import { CameraData, CAMERA_TAG, GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { Physics, PhysicsData } from '../physics';
import GameScript from '../script';

export default class LightingScript extends GameScript {
  skybox: Entity;

  person: Entity;

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
      sunlight.setComponent(GraphicsData, light);
    }

    const ambient = new Entity();
    {
      const light = new AmbientLight(0xffffff, 0.16);
      ambient.setComponent(GraphicsData, light);
    }

    this.skybox = new Entity();
    {
      // skybox state
      const imagePrefix = '/img/skybox/';
      const directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
      const imageSuffix = '.jpg';
      const skyGeometry = new BoxBufferGeometry(2000, 2000, 2000);
      const materialArray: MeshBasicMaterial[] = [];

      // load skybox images
      const loader = new ImageBitmapLoader();
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

      const skyboxMesh = new Mesh(skyGeometry, materialArray);

      // graphics component can't be added until all textures have finished loading
      // TODO use progress callbacks instead of timeouts
      setTimeout(() => this.skybox.setComponent(GraphicsData, skyboxMesh), 300);
    }

    this.person = new Entity();
    {
      const body = Physics.makeCapsule(7, 0.3, 1.737);
      body.allowSleep = false;
      body.position.y = 18;
      body.position.x = 2;
      body.fixedRotation = true;
      body.linearDamping = 0.9;
      body.updateMassProperties();
      this.person.setComponent(PhysicsData, body);
      this.assetLoader.loadModel('/models/character-base-glb/CharacterBase.glb', (mesh) => {
        this.person.setComponent(GraphicsData, mesh);

        const helper = new Entity();
        {
          const helperMesh = GraphicsUtils.makeCylinder(0.3, 1.737);
          helperMesh.material.opacity = 0.4;
          helperMesh.material.transparent = true;
          helperMesh.castShadow = true;
          helperMesh.parent = this.person.getComponent(GraphicsData);
          helper.setComponent(GraphicsData, helperMesh);
        }
      });
    }
  }

  update(dt: number) {
    // center skybox around camera
    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    this.skybox.getComponent(GraphicsData).position.copy(camera.position);
  }
}
