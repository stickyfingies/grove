import EventEmitter from 'events';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
    Cache,
    DefaultLoadingManager,
    Mesh,
    Object3D,
} from 'three';

type LogFn = (payload: object | string | number) => void;
type LoadCallback = (m: Mesh) => void;

let log: LogFn = console.log;

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
        if (logService) [log] = logService;

        Cache.enabled = true;
        let itemsLoaded: string[] = [];

        DefaultLoadingManager.onProgress = (url, loaded, total) => {
            itemsLoaded.push(url);
            this.events.emit('assetLoaded', url, loaded, total);
        };
        DefaultLoadingManager.onLoad = () => {
            log(itemsLoaded.length);
            itemsLoaded = [];
        }
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
                        const copy = this.#models[uri].clone() as Mesh;
                        copy.updateMatrixWorld();
                        cb(copy);
                    }
                    this.#callbacks[uri] = []; // this is a HUGE memory saver (i think)
                });
            }

            // load from the model cache if possible
            if (this.#models[uri]) {
                const copy = this.#models[uri].clone() as Mesh;
                copy.updateMatrixWorld();
                resolve(copy);
                this.#callbacks[uri] = []; // this is a HUGE memory saver (i think)
            }
        });
    }
}
