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
import { Entity, events } from './entities';

/**
 * Component Types
 */

export type CameraData = PerspectiveCamera;
// eslint-disable-next-line no-redeclare
export const CameraData = PerspectiveCamera;
export type GraphicsData = Object3D;
// eslint-disable-next-line no-redeclare
export const GraphicsData = Object3D;

/**
 * Graphics Frontend
 */

export class Graphics {
  // a map between mesh ID's and mesh instances
  // mesh ID's are not the same as entity ID's, as we need a compact list of meshes, but not all
  // entities will have mesh components.
  #idToEntity = new Map<number, Object3D>();

  // a map between a mesh instance and it's mesh ID
  // inverse of #idToEntity
  #entityToId = new WeakMap<Object3D, number>();

  // every time a mesh gets removed from the scene, we recycle its ID so that the list of meshes
  // stays compact.  recycled, unused IDs go into this list.
  #availableEntityIds: number[] = [];

  // the current next available entity ID
  #entityId = 0;

  // a set of all texture UUID's that have already been uploaded to the backend
  #textureCache = new Set<string>();

  // the worker thread handle on which the graphics backend is ran
  #worker = new Worker(new URL('./graphicsworker.ts', import.meta.url));

  // a cross-thread buffer of mesh transforms
  #buffer: SharedArrayBuffer;

  // an f32 array view over #buffer, used for raw access
  #array: Float32Array;

  // this camera acts as a proxy for the actual rendering camera in the backend
  #camera = new PerspectiveCamera();

  // number of bytes per each element in the shared array buffer
  readonly #bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

  // the number of elements per each transform matrix in the shared array buffer
  readonly #elementsPerTransform = 16;

  // the maximum number of meshes whcih may exist concurrently on the scene
  readonly #maxEntityCount = 1024;

  constructor() {
    const bufferSize = this.#bytesPerElement * this.#elementsPerTransform * this.#maxEntityCount;
    this.#buffer = new SharedArrayBuffer(bufferSize);
    this.#array = new Float32Array(this.#buffer);
  }

  init() {
    const offscreenCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const offscreen = offscreenCanvas.transferControlToOffscreen();

    // create the camera as a game entity
    new Entity()
      .addTag('camera')
      .setComponent(CameraData, this.#camera);
    this.assignIdToObject(this.#camera);

    // listen to component events
    events.on(`set${GraphicsData.name}Component`, (id, mesh: Mesh) => {
      this.addToScene(mesh);
    });
    events.on(`delete${GraphicsData.name}Component`, (id, mesh: Mesh) => {
      this.removeFromScene(mesh);
    });

    // initialize graphics backend
    this.#worker.postMessage({
      type: 'init',
      buffer: this.#buffer,
      canvas: offscreen,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    }, [offscreen]);

    // attach graphics backend to resize event hook
    window.addEventListener('resize', () => {
      this.#worker.postMessage({
        type: 'resize',
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  }

  update() {
    this.#idToEntity.forEach((mesh) => this.writeTransformToArray(mesh));
  }

  private removeFromScene = (object: Mesh) => {
    const id = this.#entityToId.get(object)!;

    // inform the graphics backend
    this.#worker.postMessage({
      type: 'removeObject',
      id,
    });

    // delete all relationships to meshes/IDs
    this.#idToEntity.delete(id);
    this.#entityToId.delete(object);

    // recycle the mesh ID
    this.#availableEntityIds.push(id);
  };

  private writeTransformToArray(object: Object3D) {
    // calculate offset into array given mesh ID
    const offset = this.#entityToId.get(object)! * this.#elementsPerTransform;

    // copy world matrix into transform buffer
    object.updateMatrixWorld();
    for (let i = 0; i < this.#elementsPerTransform; i++) {
      this.#array[offset + i] = object.matrixWorld.elements[i];
    }
  }

  private assignIdToObject(object: Object3D): number {
    let id = this.#entityId;

    // pick a recycled ID if one is available
    if (this.#availableEntityIds.length > 0) {
      id = this.#availableEntityIds.shift()!;
    } else {
      this.#entityId += 1;
    }

    // set mesh/ID relationships
    this.#idToEntity.set(id, object);
    this.#entityToId.set(object, id);

    return id;
  }

  private uploadTexture(map: Texture) {
    // if we've already loaded this texture and cached it, there's no work to be done.
    if (this.#textureCache.has(map.uuid)) return;

    // draw the image to a canvas
    const canvas = document.createElement('canvas');
    canvas.width = map.image.width;
    canvas.height = map.image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(map.image, 0, 0);

    // grab raw pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, map.image.width, map.image.height);

    this.#textureCache.add(map.uuid);

    // send pixel data to backend
    this.#worker.postMessage({
      type: 'uploadTexture',
      imageId: map.uuid,
      imageData: imageData.data,
      imageWidth: map.image.width,
      imageHeight: map.image.height,
    });
  }

  private addToScene(object: Mesh) {
    const id = this.assignIdToObject(object);

    // send object's texture data to backend
    // @ts-ignore
    const { map } = object.material;
    if (map) this.uploadTexture(map);

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
    // </hack>

    // send that bitch to the backend
    this.#worker.postMessage({
      type: 'addObject',
      name: object.name,
      geometry: object.geometry.toJSON(),
      material: (object.material as Material).toJSON(),
      imageId: map?.uuid,
      id,
    });
  }
}
