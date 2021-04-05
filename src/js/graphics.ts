import {
  Vector3,
  Quaternion,
  BufferGeometry,
  PerspectiveCamera,
  Object3D,
  Mesh,
  Texture,
  MeshBasicMaterial,
} from 'three';

const worker = new Worker(new URL('./graphicsworker.ts', import.meta.url));

const buffer = new SharedArrayBuffer(4 * 10 * 1024);
const array = new Float32Array(buffer);

/**
 * I think this frontend should interface with the scene graph.
 *
 * (scene graph <-> frontend) ==> backend: (worker || wasm)
 */

// this "camera" acts as a proxy for the actual rendering camera in the backend
export const camera = new PerspectiveCamera();

const idToEntity = new Map<number, Object3D>();
const entityToId = new WeakMap<Object3D, number>();
let entityId = 0;

const writeTransformToArray = (object: Object3D) => {
  // extract position, quaternion, and scale
  object.updateMatrixWorld();
  const p = new Vector3();
  const q = new Quaternion();
  const s = new Vector3();
  object.matrixWorld.decompose(p, q, s);

  // place those values into the shared array
  const offset = entityToId.get(object)! * 10;

  array[offset + 0] = p.x;
  array[offset + 1] = p.y;
  array[offset + 2] = p.z;

  array[offset + 3] = q.x;
  array[offset + 4] = q.y;
  array[offset + 5] = q.z;
  array[offset + 6] = q.w;

  array[offset + 7] = s.x;
  array[offset + 8] = s.y;
  array[offset + 9] = s.z;
};

export const updateGraphics = () => {
  idToEntity.forEach((object) => {
    writeTransformToArray(object);
  });
};

export const initGraphics = () => {
  const offscreenCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
  const offscreen = offscreenCanvas.transferControlToOffscreen();

  idToEntity.set(entityId, camera);
  entityToId.set(camera, entityId);
  entityId += 1;

  updateGraphics();

  worker.postMessage({
    type: 'init',
    buffer,
    canvas: offscreen,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  }, [offscreen]);
};

export const uploadTexture = (map: Texture) => {
  // draw the image to a canvas
  const canvas = document.createElement('canvas');
  canvas.width = map.image.width;
  canvas.height = map.image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(map.image, 0, 0);

  // grab raw pixel data from the canvas
  const imageData = ctx.getImageData(0, 0, map.image.width, map.image.height);

  // send pixel data to backend
  worker.postMessage({
    type: 'uploadTexture',
    imageName: map.name,
    imageData: imageData.data,
    imageWidth: map.image.width,
    imageHeight: map.image.height,
  });
};

export const addToScene = (object: Mesh) => {
  // register object with an ID
  idToEntity.set(entityId, object);
  entityToId.set(object, entityId);
  entityId += 1;

  // extract raw geometry data
  // @ts-ignore
  const bufferGeometry: BufferGeometry = new BufferGeometry().fromGeometry(object.geometry);
  const arrayBuffers: ArrayBufferLike[] = [];
  Object.keys(bufferGeometry.attributes).forEach((attributeName) => {
    arrayBuffers.push((bufferGeometry.attributes[attributeName].array as Float32Array).buffer);
  });

  // send object's texture data to backend
  const { map } = object.material as MeshBasicMaterial;
  if (map) uploadTexture(map);

  // send that bitch to the backend
  worker.postMessage({
    type: 'addObject',
    name: object.name,
    geometry: bufferGeometry,
    imageName: map?.name,
  }, arrayBuffers);
};

export const resizeGraphicsTarget = ({ width, height }: any) => {
  worker.postMessage({
    type: 'resize',
    width,
    height,
  });
};
