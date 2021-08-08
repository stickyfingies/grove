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
import { Physics, PhysicsData } from '../physics';
import GameScript from '../script';
import entities from '../json/entities.json';

export default class SceneSetupScript extends GameScript {
  skybox: Entity;

  person: Entity;

  init() {
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

      for (const entity of entities.spawn) {
          console.log(entity.name);
          const e = new Entity();
          if ('PhysicsData' in entity) {
              const physicsData = entity.PhysicsData!;
              switch (physicsData.type) {
              case 'capsule': {
                  const { mass, radius, height } = physicsData;
                  const body = Physics.makeCapsule(mass, radius, height);
                  body.allowSleep = false;
                  body.position.y = 18;
                  body.position.x = -6;
                  body.fixedRotation = true;
                  body.linearDamping = 0.9;
                  body.updateMassProperties();
                  e.setComponent(PhysicsData, body);
                  break;
              }
              default:
                  throw new Error(`Unable to parse PhysicsData type ${physicsData.type}`);
              }
          }
          if ('GraphicsData' in entity) {
              const graphicsData = entity.GraphicsData;
              switch (graphicsData.type) {
              case 'model': {
                  this.assetLoader.loadModel(graphicsData.path!, (mesh) => {
                      e.setComponent(GraphicsData, mesh);
                  });
                  break;
              }
              case 'light:directional': {
                  const light = new DirectionalLight(graphicsData.color, graphicsData.intensity);
                  const { x, y, z } = graphicsData.position!;
                  light.position.set(x, y, z);
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
                  e.setComponent(GraphicsData, light);
                  break;
              }
              case 'light:ambient': {
                  const light = new AmbientLight(graphicsData.color, graphicsData.intensity);
                  e.setComponent(GraphicsData, light);
                  break;
              }
              default:
                  throw new Error(`Unable to parse GraphicsData type ${graphicsData.type}`);
              }
          }
      }
  }

  update(dt: number) {
      // center skybox around camera
      const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
      this.skybox.getComponent(GraphicsData).position.copy(camera.position);
  }
}
