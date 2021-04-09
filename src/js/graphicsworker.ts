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
  Object3D,
  Matrix4,
  BufferGeometryLoader,
  MaterialLoader,
  PCFSoftShadowMap,
} from 'three';

const elementsPerTransform = 16;

const camera = new PerspectiveCamera(45, 2, 0.1, 2000);
const scene = new Scene();
let renderer: WebGLRenderer;

const idToEntity = new Map<number, Object3D>();

const textureCache = new Map<number, DataTexture>();

const init = ({
  canvas, buffer, width, height, pixelRatio,
}: any) => {
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
  renderer.shadowMap.type = PCFSoftShadowMap;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  camera.matrixAutoUpdate = false;
  scene.add(camera);
  idToEntity.set(0, camera); // see assumptions at top of this file

  const cube = new Mesh(new BoxGeometry(6, 6, 6), new MeshPhongMaterial({
    color: 0xff0000,
  }));
  cube.position.y = 30;
  scene.add(cube);

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
      // @ts-ignore
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
      const offset = Number(id) * elementsPerTransform;

      const matrix = new Matrix4().fromArray(tArr, offset);

      // <hack/>
      // before the main thread starts pushing object matrices to the transform buffer, there will
      // be a period of time where `matrix` consists of entirely zeroes.  ThreeJS doesn't
      // particularly like when scale elements are zero, so we set them to something else as a fix.
      if (matrix.elements[0] === 0) matrix.makeScale(0.1, 0.1, 0.1);

      object.matrix.copy(matrix);
    });

    skybox.position.copy(camera.position);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  };

  render();
};

const uploadTexture = ({
  imageId, imageData, imageWidth, imageHeight,
}: any) => {
  const map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.magFilter = LinearFilter;
  map.minFilter = LinearMipMapLinearFilter;
  map.generateMipmaps = true;
  map.needsUpdate = true;

  textureCache.set(imageId, map);
};

const addObject = ({
  geometry, material, imageId, id,
}: any) => {
  const geo = new BufferGeometryLoader().parse(geometry);
  const mat = new MaterialLoader().parse(material);

  const mesh = new Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.matrixAutoUpdate = false;

  // @ts-ignore
  if (imageId) mesh.material.map = textureCache.get(imageId)!;

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
