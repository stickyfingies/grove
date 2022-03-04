import EventEmitter from 'events';
// @ts-ignore
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
    Body,
    Quaternion as CQuaternion,
    Material,
    Trimesh,
    Vec3,
} from 'cannon-es';
import {
    BufferGeometry,
    Cache,
    DefaultLoadingManager,
    Group,
    Mesh,
    Object3D,
} from 'three';

type LoadCallback = (m: Mesh) => void;

export default class AssetLoader {
    /** Event bus for signalling when assets are loaded */
    readonly events = new EventEmitter();

    /** Map between model name and model data */
    #models: Record<string, Object3D> = {};

    /** Map between model name and number of cumulative requests for model */
    #accessCount: Record<string, number> = {};

    /** List of functions to be executed once a model has loaded */
    #callbacks: Record<string, LoadCallback[]> = {};

    // eslint-disable-next-line class-methods-use-this
    init() {
        Cache.enabled = true;
        DefaultLoadingManager.onProgress = (url, loaded, total) => {
            // console.log(`${url} (${loaded}/${total})`);
            this.events.emit('assetLoaded', url, loaded, total);
        };
    }

    /** Creates one or more renderable meshes from a model file */
    loadModel(uri: string): Promise<Mesh> {
        return new Promise((resolve) => {
            // increase access count for this model
            this.#accessCount[uri] ??= 0;
            this.#accessCount[uri] += 1;

            // register a new callback for when this model finishes loading
            this.#callbacks[uri] ??= [];
            this.#callbacks[uri].push(resolve);

            // if this is the first time this resource was requested, load it
            if (this.#accessCount[uri] === 1) {
                const loader = new GLTFLoader();
                loader.load(uri, ({ scene: object }: { scene: Group }) => {
                    this.#models[uri] = object;
                    this.#models[uri].updateMatrixWorld();

                    // for each child in object
                    //   upload child
                    //   for each texture in child
                    //      upload texture

                    // model may have been requested again since it started loading,
                    // serve asset to all cached requests
                    for (const cb of this.#callbacks[uri]) {
                        const copy = this.#models[uri].clone() as Mesh;
                        copy.updateMatrixWorld();
                        cb(copy);
                    }
                });
            }

            // load from the model cache if possible
            if (this.#models[uri]) {
                const ctopy = this.#models[uri].clone() as Mesh;
                ctopy.updateMatrixWorld();
                resolve(ctopy);
            }
        });
    }

    /** Takes a ThreeJS BufferGeometry and produces a CannonJS shape from it */
    static loadPhysicsShape(geometry: BufferGeometry) {
        const verts = geometry.getAttribute('position').array as number[];
        const faces = geometry.index?.array as number[];
        const shape = new Trimesh(verts, faces);
        return shape;
    }

    /** Creates a physics body from a renderable mesh's geometry */
    static loadPhysicsModel({ geometry, position, quaternion }: Mesh, mass: number) {
        const shape = this.loadPhysicsShape(geometry);
        const material = new Material('trimeshMaterial');
        const body = new Body({
            mass,
            material,
        });
        body.addShape(shape);

        // copy transform from mesh -> physics body
        // TODO vector utils would simplify this
        const { x: px, y: py, z: pz } = position;
        const {
            x: qx, y: qy, z: qz, w: qw,
        } = quaternion;
        body.position.copy(new Vec3(px, py, pz));
        body.quaternion.copy(new CQuaternion(qx, qy, qz, qw));

        return body;
    }
}