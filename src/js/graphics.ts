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
  Material,
} from 'three';
import { DataManager, registerDataManager } from './entities';

const worker = new Worker(new URL('./graphicsworker.ts', import.meta.url));

const bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
const elementsPerTransform = 16;
const maxEntityCount = 1024;

const buffer = new SharedArrayBuffer(bytesPerElement * elementsPerTransform * maxEntityCount);
const array = new Float32Array(buffer);

const idToEntity = new Map<number, Object3D>();
const entityToId = new WeakMap<Object3D, number>();
const availableEntityIds: number[] = [];

let entityId = 0;

const textureCache = new Map<string, ImageData>();

// this camera acts as a proxy for the actual rendering camera in the backend
export const camera = new PerspectiveCamera();

export type GraphicsData = Object3D;
// eslint-disable-next-line no-redeclare
export const GraphicsData = Object3D;

const writeTransformToArray = (object: Object3D) => {
  const offset = entityToId.get(object)! * elementsPerTransform;

  // copy world matrix into transform buffer
  object.updateMatrixWorld();
  for (let i = 0; i < elementsPerTransform; i++) {
    array[offset + i] = object.matrixWorld.elements[i];
  }
};

const assignIdToObject = (object: Object3D): number => {
  let id = entityId;

  if (availableEntityIds.length > 0) {
    id = availableEntityIds.shift()!;
  } else {
    entityId += 1;
  }

  idToEntity.set(id, object);
  entityToId.set(object, id);

  return id;
};

const uploadTexture = (map: Texture) => {
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

const addToScene = (object: Mesh) => {
  const id = assignIdToObject(object);
  console.log(`addToScene: adding mesh#${id}`);

  // send object's texture data to backend
  // @ts-ignore
  const { map } = object.material;
  if (map) uploadTexture(map);

  // <hack>
  // @ts-ignore
  delete object.geometry.parameters;
  // @ts-ignore
  delete object.material.map;
  // @ts-ignore
  delete object.material.matcap;
  // @ts-ignore
  delete object.material.alphaMap;
  // @ts-ignore
  delete object.material.bumpMap;
  // @ts-ignore
  delete object.material.normalMap;
  // @ts-ignore
  delete object.material.displacementMap;
  // @ts-ignore
  delete object.material.roughnessMap;
  // @ts-ignore
  delete object.material.metalnessMap;
  // @ts-ignore
  delete object.material.emissiveMap;
  // @ts-ignore
  delete object.material.specularMap;
  // @ts-ignore
  delete object.material.envMap;
  // @ts-ignore
  delete object.material.lightMap;
  // @ts-ignore
  delete object.material.aoMap;
  // @ts-ignore
  delete object.material.gradientMap;
  // </hack>

  // send that bitch to the backend
  worker.postMessage({
    type: 'addObject',
    name: object.name,
    geometry: object.geometry.toJSON(),
    material: (object.material as Material).toJSON(),
    imageId: map?.uuid,
    id,
  });
};

const removeFromScene = (object: Mesh) => {
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

class GraphicsManager implements DataManager {
  components = new Map<number, Object3D>();

  setComponent(entity: number, data: any) {
    console.log(`manager: adding entity#${entity}`);
    addToScene(data);
    this.components.set(entity, data);
  }

  getComponent(entity: number) {
    return this.components.get(entity)!;
  }

  hasComponent(entity: number) {
    return this.components.has(entity);
  }

  deleteComponent(entity: number) {
    removeFromScene(this.components.get(entity) as Mesh);
    return this.components.delete(entity);
  }
}

export const updateGraphics = () => {
  idToEntity.forEach(writeTransformToArray);
};

export const initGraphics = () => {
  const offscreenCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
  const offscreen = offscreenCanvas.transferControlToOffscreen();

  registerDataManager(GraphicsData, new GraphicsManager());

  assignIdToObject(camera);

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
