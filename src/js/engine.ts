import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import autoBind from 'auto-bind';
import { Cache, DefaultLoadingManager } from 'three';

import AssetLoader from './load';
import Entity from './ecs/entity';
import EntityManager from './ecs/entity-manager';
import GameScript from './script';
import gameScripts from './game/_scripts.json';
import maps from './json/maps.json';
import { Graphics, GraphicsData } from './graphics/graphics';
import { Physics, PhysicsData } from './physics';

export default class Engine {
    running = false;

    #lastFrameTime = 0;

    #gameScripts: GameScript[] = [];

    #stats = new Stats();

    #gui = new GUI();

    #graphics = new Graphics();

    #physics = new Physics();

    #assetLoader = new AssetLoader();

    #ecs = new EntityManager();

    /** Convenience method */
    get gui() { return this.#gui; }

    /** Convenience method */
    get graphics() { return this.#graphics; }

    /** Convenience method */
    get physics() { return this.#physics; }

    /** Convenience method */
    get assetLoader() { return this.#assetLoader; }

    /** Convenience method */
    get ecs() { return this.#ecs; }

    constructor() {
        autoBind(this);
    }

    async init() {
        Entity.defaultManager = this.ecs;
        Cache.enabled = true;

        // initialize engine systems
        this.graphics.init(this);
        this.physics.init(this);

        // TODO move `onProgress` into AssetLoader, and UI into a game script
        // show asset loading progress
        DefaultLoadingManager.onProgress = (url, loaded, total) => {
            console.log(`${url} (${loaded}/${total})`);
            if (loaded === total) {
                document.querySelector('#spinner')?.setAttribute('style', 'display:none');
                document.querySelector('#load-play-btn')?.setAttribute('style', 'display:block');
            }
        };

        // dynamically load game scripts
        const scriptModules: any[] = [];
        for (const scriptName of gameScripts.scripts) {
            scriptModules.push(import(`./game/${scriptName}`));
        }

        // init game scripts
        for (const scriptModule of await Promise.all(scriptModules)) {
            // eslint-disable-next-line new-cap
            const script: GameScript = new scriptModule.default(this);
            this.#gameScripts.push(script);
            script.init();
        }

        // load the map
        const map = maps['test-arena'];
        for (const path of map.objects) {
            // we can't use `loadAsync` here because the map model may contain several meshes
            this.assetLoader.loadModel(path, (mesh) => {
                const body = AssetLoader.loadPhysicsModel(mesh, 0);
                mesh.receiveShadow = true;
                new Entity()
                    .setComponent(GraphicsData, mesh)
                    .setComponent(PhysicsData, body);
            });
        }

        // between the game scripts and the map, we probably just created a bunch of renderables.
        // start that backend work now so it isn't being done when the first frame starts rendering.
        this.graphics.update();

        // show performance statistics
        this.#stats.showPanel(1);
        document.body.appendChild(this.#stats.dom);

        requestAnimationFrame(this.update);
    }

    update(now: number) {
        const delta = now - this.#lastFrameTime;

        this.#stats.begin();

        if (this.running) {
            // step physics
            this.physics.update(delta);

            // run per-frame game tasks
            for (const script of this.#gameScripts) script.update(delta);

            // render scene
            this.graphics.update();
        }

        this.#stats.end();

        this.#lastFrameTime = now;

        requestAnimationFrame(this.update);
    }
}
