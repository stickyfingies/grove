/**
 * @see graphics.ts for information on how object transforms are communicated
 */

import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  Sprite,
  MeshPhongMaterial,
  DataTexture,
  RGBAFormat,
  RepeatWrapping,
  LinearFilter,
  BoxGeometry,
  LinearMipMapLinearFilter,
  Object3D,
  Matrix4,
  MaterialLoader,
  PCFSoftShadowMap,
  ObjectLoader,
} from 'three';

/**
 * Graphics Backend Data Specs
 */

type ObjectJson = any;

interface GraphicsBackendInitData {
  canvas: HTMLCanvasElement,
  buffer: SharedArrayBuffer,
  width: number,
  height: number,
  pixelRatio: number
}

interface GraphicsBackendUploadTextureData {
  imageId: number,
  imageWidth: number,
  imageHeight: number,
  imageData: ArrayBufferView,
}

interface GraphicsBackendAddObjectData {
  mesh: ObjectJson,
  colorMapId: number,
  id: number
}

interface GraphicsBackendRemoveObjectData {
  id: number
}

interface GraphicsBackendResizeData {
  width: number,
  height: number
}

interface GraphicsBackendUpdateMaterialData {
  material: ObjectJson,
  id: number,
}

/**
 * Graphics backend designed to be ran on a WebWorker
 */
export default class GraphicsBackend {
  // eslint-disable-next-line no-undef
  [idx: string]: Function;

  /**
   * main camera used to render the scene
   * @note camera has Id#0
   */
  #camera = new PerspectiveCamera(45, 2, 0.1, 2000);

  /** a scene graph object which holds all renderable meshes */
  #scene = new Scene();

  /** ThreeJS WebGL renderer instance */
  #renderer: WebGLRenderer;

  /** map of mesh IDs to mesh instances */
  #idToObject = new Map<number, Object3D>();

  /** map of texture identifiers to raw image data */
  #textureCache = new Map<number, DataTexture>();

  /** number of elements per each transform matrix in the shared array buffer */
  readonly #elementsPerTransform = 16;

  init({
    canvas, buffer, width, height, pixelRatio,
  }: GraphicsBackendInitData) {
    const tArr = new Float32Array(buffer);

    const context = canvas.getContext('webgl2', { antialias: true })!;

    // initialize renderer instance
    this.#renderer = new WebGLRenderer({
      canvas,
      context,
      antialias: true,
    });
    this.#renderer.setClearColor(0x000000);
    this.#renderer.setSize(width, height, false);
    this.#renderer.setPixelRatio(pixelRatio);
    this.#renderer.shadowMap.enabled = true;
    this.#renderer.shadowMap.type = PCFSoftShadowMap;

    // set up camera
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    this.#camera.matrixAutoUpdate = false;
    this.#scene.add(this.#camera);
    this.#idToObject.set(0, this.#camera);

    // test cube
    const cube = new Mesh(new BoxGeometry(6, 6, 6), new MeshPhongMaterial({
      color: 0xff0000,
    }));
    cube.position.y = 30;
    this.#scene.add(cube);

    // backend thread render loop
    const render = () => {
      cube.rotateY(0.01);

      // copy transforms from transform buffer
      for (const [id, object] of this.#idToObject) {
        const offset = Number(id) * this.#elementsPerTransform;
        const matrix = new Matrix4().fromArray(tArr, offset);

        // ! <hack/>
        // before the main thread starts pushing object matrices to the transform buffer, there will
        // be a period of time where `matrix` consists of entirely zeroes.  ThreeJS doesn't
        // particularly like when scale elements are zero, so set them to something else as a fix.
        if (matrix.elements[0] === 0) matrix.makeScale(0.1, 0.1, 0.1);

        object.matrix.copy(matrix);
      }

      this.#renderer.render(this.#scene, this.#camera);

      requestAnimationFrame(render);
    };

    // start rendering
    requestAnimationFrame(render);
  }

  uploadTexture({
    imageId, imageData, imageWidth, imageHeight,
  }: GraphicsBackendUploadTextureData) {
    const map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);

    // set texture options
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.magFilter = LinearFilter;
    map.minFilter = LinearMipMapLinearFilter;
    map.generateMipmaps = true;
    map.flipY = true;
    map.needsUpdate = true;

    // store texture in cache
    this.#textureCache.set(imageId, map);
  }

  updateMaterial({ material, id }: GraphicsBackendUpdateMaterialData) {
    const mat = this.deserializeMaterial(material);

    const mesh = this.#idToObject.get(id)! as Mesh | Sprite;

    mesh.material = mat;
  }

  addObject({
    id, mesh,
  }: GraphicsBackendAddObjectData) {
    const mat: MeshPhongMaterial[] = [];

    if (mesh.materials) {
      for (const material of mesh.materials) {
        mat.push(this.deserializeMaterial(material));
      }
    }

    mesh.images = [];
    mesh.textures = [];

    const object = new ObjectLoader().parse(mesh);

    if (object instanceof Mesh || object instanceof Sprite) {
      object.material = mat.length > 1 ? mat : mat[0];
    }
    object.matrixAutoUpdate = false;

    this.#scene.add(object);
    this.#idToObject.set(id, object);
  }

  removeObject({ id }: GraphicsBackendRemoveObjectData) {
    const object = this.#idToObject.get(id)!;
    this.#idToObject.delete(id);
    this.#scene.remove(object);
  }

  resize({ width, height }: GraphicsBackendResizeData) {
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();

    this.#renderer.setSize(width, height, false);
  }

  private deserializeMaterial(json: ObjectJson) {
    const {
      map, alphaMap, normalMap, specularMap,
    } = json;

    delete json.map; //
    delete json.matcap;
    delete json.alphaMap; //
    delete json.bumpMap;
    delete json.normalMap; //
    delete json.displacementMap;
    delete json.roughnessMap;
    delete json.metalnessMap;
    delete json.emissiveMap;
    delete json.specularMap; //
    delete json.envMap;
    delete json.lightMap;
    delete json.aoMap;

    const mat = new MaterialLoader().parse(json) as MeshPhongMaterial;

    // assign textures
    if (map) mat.map = this.#textureCache.get(map)!;
    if (alphaMap) mat.alphaMap = this.#textureCache.get(alphaMap)!;
    if (normalMap) mat.normalMap = this.#textureCache.get(normalMap)!;
    if (specularMap) mat.specularMap = this.#textureCache.get(specularMap)!;

    return mat;
  }
}
