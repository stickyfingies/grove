/**
 * See `graphics.ts` for information on how object transforms are communicated
 *
 * Assumptions: Camera has ID #0
 */

import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  RGBAFormat,
  ImageBitmapLoader,
  CanvasTexture,
  RepeatWrapping,
  LinearFilter,
  BoxGeometry,
  MeshBasicMaterial,
  BackSide,
  LinearMipMapLinearFilter,
  Vector3,
  Quaternion,
  Object3D,
} from 'three';

const camera = new PerspectiveCamera(45, 2, 0.01, 2000);
const scene = new Scene();
let renderer: WebGLRenderer;

const idToEntity: Map<number, Object3D> = new Map();

// let geometryCache = {};
const textureCache = {} as any;

const init = (data: any) => {
  const {
    canvas, buffer, width, height, pixelRatio,
  } = data;

  const tArr = new Float32Array(buffer);

  const context = canvas.getContext('webgl2', { antialias: true });

  renderer = new WebGLRenderer({
    canvas,
    context,
    antialias: true,
  });
  renderer.setClearColor(0x000000);
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled = true;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  scene.add(camera);
  idToEntity.set(0, camera); // see assumptions at top of this file

  const cube = new Mesh(new BoxGeometry(6, 6, 6), new MeshPhongMaterial({
    color: 0xff0000,
  }));
  cube.position.y = 30;
  scene.add(cube);

  const light = new DirectionalLight(0xffffff, 1);
  light.position.set(10, 30, -20);
  light.castShadow = true;
  const { shadow } = light;
  shadow.camera.left = -1024;
  shadow.camera.right = 1024;
  shadow.camera.top = 1024;
  shadow.camera.bottom = -1024;
  shadow.mapSize.width = 1024;
  shadow.mapSize.height = 1024;

  scene.add(light);

  const imagePrefix = '/img/skybox/';
  const directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
  const imageSuffix = '.jpg';
  const skyGeometry = new BoxGeometry(2000, 2000, 2000);
  const materialArray: MeshBasicMaterial[] = [];

  const loader = new ImageBitmapLoader();
  loader.setOptions({
    imageOrientation: 'flipY',
  });
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

  const skybox = new Mesh(skyGeometry, materialArray);
  scene.add(skybox);

  const render = () => {
    cube.rotateY(0.01);
    skybox.rotateY(0.0001);

    // copy transforms from transform buffer
    idToEntity.forEach((object, id) => {
      const offset = Number(id) * 10;
      object.position.copy(new Vector3(tArr[offset + 0], tArr[offset + 1], tArr[offset + 2]));
      // eslint-disable-next-line max-len
      object.quaternion.copy(new Quaternion(tArr[offset + 3], tArr[offset + 4], tArr[offset + 5], tArr[offset + 6]));

      /**
       * Scale sometimes resolves as 0, causing ThreeJS issues.
       * todo: figure out why this happens.  for now, ignore scale
       */

      // object.scale.copy(new Vector3(tArr[offset + 7], tArr[offset + 8], tArr[offset + 9]));
    });

    skybox.position.copy(camera.position);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  };

  render();
};

const uploadTexture = ({
  imageName, imageData, imageWidth, imageHeight,
}: any) => {
  if (textureCache[imageName]) return;

  const map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.magFilter = LinearFilter;
  map.minFilter = LinearMipMapLinearFilter;
  map.generateMipmaps = true;
  map.needsUpdate = true;

  textureCache[imageName] = map;
};

const addObject = ({ geometry, imageName, id }: any) => {
  const shallowGeometry = geometry;
  const buffergeo = new BufferGeometry();

  Object.keys(shallowGeometry.attributes).forEach((attributeName) => {
    const shallowAttribute = shallowGeometry.attributes[attributeName];
    const attribute = new BufferAttribute(
      shallowAttribute.array,
      shallowAttribute.itemSize,
      false,
    );
    buffergeo.addAttribute(attributeName, attribute);
  });

  const mesh = new Mesh(buffergeo, new MeshPhongMaterial());
  if (imageName) mesh.material.map = textureCache[imageName];
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  idToEntity.set(id, mesh);
};

const removeObject = ({ id }: any) => {
  const object = idToEntity.get(id)!;
  idToEntity.delete(id);
  scene.remove(object);
};

const resize = ({ width, height }: any) => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
};

const messageHandlers = {
  init,
  uploadTexture,
  addObject,
  removeObject,
  resize,
} as any;

onmessage = ({ data }: any) => {
  const { type } = data;
  if (messageHandlers[type]) messageHandlers[type](data);
  else console.error(`no graphics handler registered for ${type}`);
};
