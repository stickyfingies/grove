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
  PerspectiveCamera,
  Object3D,
  Mesh,
  Texture,
  MeshBasicMaterial,
} from 'three';

const worker = new Worker(new URL('./graphicsworker.ts', import.meta.url));

const bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
const elementsPerTransform = 16;
const maxEntityCount = 1024;

const buffer = new SharedArrayBuffer(bytesPerElement * elementsPerTransform * maxEntityCount);
const array = new Float32Array(buffer);

// this camera acts as a proxy for the actual rendering camera in the backend
export const camera = new PerspectiveCamera();

const idToEntity = new Map<number, Object3D>();
const entityToId = new WeakMap<Object3D, number>();
const availableEntityIds: number[] = [];

let entityId = 0;

const textureCache = new Map<string, ImageData>();

const writeTransformToArray = (object: Object3D) => {
  const offset = entityToId.get(object)! * elementsPerTransform;

  // copy world matrix into transform buffer
  object.updateMatrixWorld();
  for (let i = 0; i < elementsPerTransform; i++) {
    array[offset + i] = object.matrixWorld.elements[i];
  }
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
  if (textureCache.has(map.uuid)) return;

  // draw the image to a canvas
  const canvas = document.createElement('canvas');
  canvas.width = map.image.width;
  canvas.height = map.image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(map.image, 0, 0);

  // grab raw pixel data from the canvas
  const imageData = ctx.getImageData(0, 0, map.image.width, map.image.height);

  textureCache.set(map.uuid, imageData);

  // send pixel data to backend
  worker.postMessage({
    type: 'uploadTexture',
    imageId: map.uuid,
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

  // send object's texture data to backend
  const { map } = object.material as MeshBasicMaterial;
  if (map) uploadTexture(map);

  // @ts-ignore
  // eslint-disable-next-line no-param-reassign
  delete object.geometry.parameters;

  // send that bitch to the backend
  worker.postMessage({
    type: 'addObject',
    name: object.name,
    geometry: object.geometry.toJSON(),
    imageId: map?.uuid,
    id,
  });
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
