import EventEmitter from 'events';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
    BufferGeometry,
    Cache,
    DefaultLoadingManager,
    Material,
    Mesh,
    Object3D,
} from 'three';

type LogFn = (payload: object | string | number) => void;
type LoadCallback = (m: Mesh) => void;

let log: LogFn = console.log;
let report: LogFn = console.error;

export class BoxShape {
    width: number = 1;
    height: number = 1;
    depth: number = 1;
}

export class SphereShape {
    radius: number = 1;
}

export class CapsuleShape {
    radius: number = 1;
    height: number = 1;
}

export class ModelShape {
    uri: string = '';
}

export type MeshDescriptor = {
    /** Index in a model's `geometries` list */
    geometry: number,
    /** Starting index in a model's `materials` list */
    material: number,
    /** Number of materials in this mesh */
    materialCount: number,
}

export class Model {
    geometries: BufferGeometry[] = [];
    materials: Material[] = [];
    meshes: MeshDescriptor[] = [];
}

export type AssetsLoadedEvent = {
    paths: string[];
    names: string[];
};

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
    init(logService?: LogFn[]) {
        if (logService) { [log, report] = logService; }

        Cache.enabled = true;
        let loadedPaths: string[] = [];
        let loadedNames: string[] = [];

        DefaultLoadingManager.onProgress = (url, loaded, total) => {
            const name = url.startsWith('blob')
                ? 'blob'
                : url.split('/').pop()!;
            loadedPaths.push(url);
            loadedNames.push(name);
        };
        DefaultLoadingManager.onLoad = () => {
            log(`Loaded ${loadedPaths.length} assets`);
            const event: AssetsLoadedEvent = {
                paths: loadedPaths,
                names: loadedNames,
            };
            this.events.emit('assetsLoaded', event);
            loadedPaths = [];
            loadedNames = [];
        }
        DefaultLoadingManager.onError = (url) => {
            report(`Failed to load ${url}`);
        };
    }

    /** Creates one or more renderable meshes from a model file */
    loadModel({ uri }: ModelShape): Promise<Mesh> {
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
                loader.load(uri, ({ scene }) => {
                    this.#models[uri] = scene;
                    this.#models[uri].updateMatrixWorld();

                    // for each child in object
                    //   upload child
                    //   for each texture in child
                    //      upload texture

                    // model may have been requested again since it started loading,
                    // serve asset to all cached requests
                    for (const cb of this.#callbacks[uri]) {
                        //? debug // console.trace(`Loading ${uri}`);
                        const copy = this.#models[uri].clone() as Mesh;
                        copy.updateMatrixWorld();
                        cb(copy);
                    }
                    this.#callbacks[uri] = []; // this is a HUGE memory saver (i think)
                });
            }

            // load from the model cache if possible
            if (this.#models[uri]) {
                //? debug // console.trace(`Loading ${uri}`);
                const copy = this.#models[uri].clone() as Mesh;
                copy.updateMatrixWorld();
                resolve(copy);
                this.#callbacks[uri] = []; // this is a HUGE memory saver (i think)
            }
        });
    }

    /** @experimental - use `loadModel` for general use cases. */
    /** Returns raw buffers of geometries, materials, and meshes */
    async loadModelData(shape: ModelShape): Promise<Model> {
        const modelData = new Model();
        const modelScene = await this.loadModel(shape);
        modelScene.traverse((node) => {
            // filter meshes
            if (node instanceof Mesh) {
                node.updateMatrix();
                const geometry = modelData.geometries.push(node.geometry);
                const materialCount = node.material.length ?? 1;
                const material = (materialCount > 1)
                    ? modelData.materials.push(...node.material)
                    : modelData.materials.push(node.material);
                modelData.meshes.push({ geometry, material, materialCount });
            }
        });
        return modelData;
    }
}
