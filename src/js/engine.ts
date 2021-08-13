import EventEmitter from 'events';
import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import autoBind from 'auto-bind';

import AssetLoader from './load';
import Entity from './ecs/entity';
import EntityManager from './ecs/entity-manager';
import GameScript from './script';

import gameScripts from './game/_scripts.json';
import maps from './json/maps.json';
import { Graphics, GraphicsData } from './graphics/graphics';
import { Physics, PhysicsData } from './physics';

export default class Engine {
    readonly events = new EventEmitter();

    readonly gui = new GUI();

    readonly graphics = new Graphics();

    readonly physics = new Physics();

    readonly assetLoader = new AssetLoader();

    readonly ecs = new EntityManager();

    #running = false;

    #lastFrameTime = 0;

    #gameScripts: GameScript[] = [];

    #stats = new Stats();

    constructor() {
        autoBind(this);
    }

    async init() {
        Entity.defaultManager = this.ecs;

        // initialize engine systems
        this.graphics.init(this);
        this.physics.init(this);
        this.assetLoader.init();

        // set up engine events
        this.events.on('start', () => { this.#running = true; });
        this.events.on('stop', () => { this.#running = false; });

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
        // run backend work now, so it isn't being done right when the first frame starts rendering.
        this.graphics.update();

        // show performance statistics
        this.#stats.showPanel(1);
        document.body.appendChild(this.#stats.dom);

        requestAnimationFrame(this.update);
    }

    update(now: number) {
        const delta = now - this.#lastFrameTime;

        this.#stats.begin();

        if (this.#running) {
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
