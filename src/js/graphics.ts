/**
 * ===========================
 * Adding and Removing Objects
 * ===========================
 *
 * The situation is a little complicated, but it effectively works like this:
 *
 * Every time we create an object, we associate it with a unique ID that we can use to set/retrieve
 * its transform info from the shared array buffer.  When we delete an object, we recycle its ID, so
 * that future entities can reuse that slot in the shared buffer.  We do this by adding the removed
 * entity's ID to a list, `availableEntityIds`.  Whenever a new entity is added to the scene, we
 * first check that list to see if we can recycle any old, unused entity IDs.  If we cannot do that,
 * we increment a global counter and use that as the entity's ID - effectively, putting it at the
 * end of the shared array buffer.
 *
 * Assumptions: Camera has ID #0
 */

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

const maxEntityCount = 1024;
const buffer = new SharedArrayBuffer(4 * 10 * maxEntityCount);
const array = new Float32Array(buffer);

// this "camera" acts as a proxy for the actual rendering camera in the backend
export const camera = new PerspectiveCamera();

const idToEntity = new Map<number, Object3D>();
const entityToId = new WeakMap<Object3D, number>();
let entityId = 0;
const availableEntityIds: number[] = [];

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
  let id = entityId;

  if (availableEntityIds.length > 0) {
    id = availableEntityIds.shift()!;
  } else {
    entityId += 1;
  }

  // register object with an ID
  idToEntity.set(id, object);
  entityToId.set(object, id);

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
    id,
  }, arrayBuffers);
};

export const removeFromScene = (object: Mesh) => {
  const id = entityToId.get(object)!;

  worker.postMessage({
    type: 'removeObject',
    id,
  });

  idToEntity.delete(id);
  entityToId.delete(object);
  availableEntityIds.push(id);
};

export const resizeGraphicsTarget = ({ width, height }: any) => {
  worker.postMessage({
    type: 'resize',
    width,
    height,
  });
};
