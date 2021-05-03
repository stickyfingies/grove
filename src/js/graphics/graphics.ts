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
  Sprite,
  Texture,
  Material,
  Raycaster,
  Vector2,
  Scene,
  Light,
} from 'three';
import Engine from '../engine';
import { Entity } from '../entities';
import GraphicsUtils from './utils';

export type CameraData = PerspectiveCamera;
// eslint-disable-next-line no-redeclare
export const CameraData = PerspectiveCamera;
export type MeshData = Mesh | Sprite | Light;
// eslint-disable-next-line no-redeclare
export const MeshData = Object3D;

export const CAMERA_TAG = Symbol('camera');

/**
 * Graphics Frontend
 */

export class Graphics {
  // a tree-like graph of the game scene, used for parent-child relationships between renderables
  #scene = new Scene();

  // a map between mesh ID's and mesh instances
  // mesh ID's are not the same as entity ID's, as we need a compact list of meshes, but not all
  // entities will have mesh components.
  #idToObject = new Map<number, Object3D>();

  // every time a mesh gets removed from the scene, we recycle its ID so that the list of meshes
  // stays compact.  recycled, unused IDs go into this list.
  #availableObjectIds: number[] = [];

  // the current next available entity ID
  #objectId = 0;

  // a set of all texture UUID's that have already been uploaded to the backend
  #textureCache = new Set<string>();

  // the worker thread handle on which the graphics backend is ran
  #worker = new Worker(new URL('./worker.ts', import.meta.url));

  // a cross-thread buffer of mesh transforms
  #buffer: SharedArrayBuffer;

  // an f32 array view over #buffer, used for raw access
  #array: Float32Array;

  // this camera acts as a proxy for the actual rendering camera in the backend
  // todo: should cameras be treated specially (as they currently are)?
  #camera = new PerspectiveCamera();

  // number of bytes per each element in the shared array buffer
  readonly #bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

  // the number of elements per each matrix in the transform buffer (4x4 matrix = 16)
  readonly #elementsPerTransform = 16;

  // the maximum number of meshes whcih may exist concurrently
  readonly #maxEntityCount = 1024;

  constructor() {
    const bufferSize = this.#bytesPerElement * this.#elementsPerTransform * this.#maxEntityCount;
    this.#buffer = new SharedArrayBuffer(bufferSize);
    this.#array = new Float32Array(this.#buffer);
  }

  init(engine: Engine) {
    const offscreenCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const offscreen = offscreenCanvas.transferControlToOffscreen();

    // create the camera as a game entity
    new Entity(engine.eManager)
      .addTag(CAMERA_TAG)
      .setComponent(CameraData, this.#camera);
    this.assignIdToObject(this.#camera);

    // listen to component events
    engine.eManager.events.on(`set${MeshData.name}Component`, (id, object: Mesh | Sprite | Light) => {
      object.traverse((child) => {
        if (child instanceof Mesh || child instanceof Sprite || child instanceof Light) {
          this.addObjectToScene(child);
        }
      });
    });
    engine.eManager.events.on(`delete${MeshData.name}Component`, (id, mesh: Mesh) => {
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
    this.#idToObject.forEach((mesh) => this.writeTransformToArray(mesh));
  }

  // changes to material properties made by game code are not automatically mirrored by the backend.
  // thus, materials need to be manually flushed after updates
  updateMaterial(object: Mesh | Sprite) {
    this.extractMaterialTextures(object.material as Material);

    this.#worker.postMessage({
      type: 'updateMaterial',
      material: (object.material as Material).toJSON(),
      id: object.userData.meshId,
    });
  }

  raycast() {
    const raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(), this.#camera);

    return raycaster.intersectObjects(Array.from(this.#idToObject.values()));
  }

  private removeFromScene = (object: Object3D) => {
    const id = object.userData.meshId;

    // inform the graphics backend
    this.#worker.postMessage({
      type: 'removeObject',
      id,
    });

    // recycle ID
    this.#idToObject.delete(id);
    this.#availableObjectIds.push(id);
  };

  private writeTransformToArray(object: Object3D) {
    // calculate offset into array given mesh ID
    const offset = object.userData.meshId * this.#elementsPerTransform;

    // copy world matrix into transform buffer
    object.updateMatrixWorld();
    for (let i = 0; i < this.#elementsPerTransform; i++) {
      this.#array[offset + i] = object.matrixWorld.elements[i];
    }
  }

  private assignIdToObject(object: Object3D): number {
    let id = this.#objectId;

    // pick a recycled ID if one is available
    if (this.#availableObjectIds.length > 0) {
      id = this.#availableObjectIds.shift()!;
    } else {
      this.#objectId += 1;
    }

    // set mesh/ID relationships
    this.#idToObject.set(id, object);
    object.userData.meshId = id;

    return id;
  }

  /**
   * Ship a texture to the graphics backend, but only if the texture has not already been uploaded.
   * Responsible for both graphics and asset loading; being on the backend is where it 'matters'
   */
  private uploadTexture(map: Texture) {
    // if we've already loaded this texture and cached it, there's no work to be done.
    if (this.#textureCache.has(map.uuid)) return;

    // grab raw image data from the texture
    const { ctx } = GraphicsUtils.scratchCanvasContext(map.image.width, map.image.height);
    ctx.drawImage(map.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, map.image.width, map.image.height);

    // cache it
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

  private extractMaterialTextures(material: Material) {
    // @ts-ignore
    const { map, alphaMap } = material;
    if (map) this.uploadTexture(map);
    if (alphaMap) this.uploadTexture(alphaMap);
  }

  /**
   * Upload a renderable object to the graphics backend.
   * Establishing a scene hierarchy is possible by specifying `object.parent`
   * Current supported objects: Mesh, Sprite
   */
  private addObjectToScene(object: Object3D) {
    // maintain a scene-graph-like structure
    if (object.parent) object.parent.add(object);
    else this.#scene.add(object);

    const id = this.assignIdToObject(object);

    // send object's texture data to backend
    if (object instanceof Mesh || object instanceof Sprite) {
      this.extractMaterialTextures(object.material as Material);
    }

    // some fix for serializing spheres. is this still necessary?
    if (object instanceof Mesh) delete object.geometry.parameters;

    // send that bitch to the backend
    this.#worker.postMessage({
      type: 'addObject',
      name: object.name,
      mesh: object.toJSON(),
      id,
    });
  }
}
