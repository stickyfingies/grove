import EventEmitter from 'events';
import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import autoBind from 'auto-bind';

import AssetLoader from './load';
import Entity from './ecs/entity';
import EntityManager from './ecs/entity-manager';
import LogService from './log'
import { GameSystem } from './script';
import {
    CAMERA_TAG,
    CameraData,
    Graphics,
} from '3-AD';
import { Physics } from 'firearm';

export const gui = new GUI();
export const graphics = new Graphics(LogService('graphics'), LogService('graphics:worker'));
export const physics = new Physics();
export const assetLoader = new AssetLoader();

/// for things that live in the world
export const world = new EntityManager();
/// for things that live in the code
export const codex = new EntityManager();

export const events = new EventEmitter();

export class EngineSystem {
    static get is_system() { return true; }

    on_load(): void { };

    start(): void { };

    update(): void { };
}

export default class Engine {
    #running = false;

    #lastFrameTime = 0;

    #gameScripts: GameSystem[] = [];

    #stats = new Stats();

    #physicsStats = new Stats();

    #scriptStats = new Stats();

    #graphicsStats = new Stats();

    constructor() {
        autoBind(this);
    }

    async init() {
        const [log, report] = LogService('window');
        // @ts-ignore - Useful for debugging
        window.log = log;
        // @ts-ignore - Useful for debugging
        window.report = report;

        Entity.defaultManager = world;

        // physics.init();

        events.on('startLoop', () => { this.#running = true; });
        events.on('stopLoop', () => { this.#running = false; });

        const token = physics.init(world.events, LogService('physics'), LogService('physics:worker'));
        graphics.init();
        assetLoader.init(LogService('load'));
        await token;

        // create camera
        new Entity(world)
            .addTag(CAMERA_TAG)
            .setComponent(CameraData, graphics.camera);

        // schedule A
        // schedule B
        // schedule C, which runs after awaiting A and B
        // schedule D, which runs every time E runs
        // schedule E
        // schedule D (because E was scheduled)

        // jobsys.alwaysAfter(dependencies, job);
        // jobsys.after(dependencies, job);

        // A graph is JUST a graph, with node and edge data included.  Graphs could be inserted
        // straight into the scheduler, like a frame execution graph just having its commands
        // executed in order; OR, it could be dropped in starting from any particular "start" node,
        // like with events.

        // static built graphs for reusability
        // ^ that way: don't need to store GameScripts!  Give their `init` a graph, they'll
        // ^ schedule work within that graph and it can later be executed each frame.

        // @ts-ignore - TSC and Vite aren't playing nice still
        const modules: Record<string, Function> = import.meta.glob('./game/**/*.ts');

        const module_promises = Object
            .entries(modules)
            .map(([_, loadModule]) => loadModule());

        const game_modules = await Promise.all(module_promises) as { [s: string]: any }[];

        const plugins = game_modules
            .flatMap(module => Object.entries(module))
            .filter(([_key, val]) => val.is_system)
            .map(([_a, b]) => new b());

        console.log(plugins);

        this.#gameScripts = game_modules
            .filter(module => 'default' in module)
            .map(module => new module.default(this));

        this.#gameScripts.forEach(script => { if ('init' in script) script.init() });

        // between the game scripts and the map, we probably just created a bunch of renderables.
        // run backend work now, so it isn't being done right when the first frame starts rendering.
        graphics.update();

        // show performance statistics
        this.#stats.showPanel(2);
        document.body.appendChild(this.#stats.dom);
        this.#physicsStats.showPanel(1);
        this.#physicsStats.dom.style.cssText = 'position:absolute;top:0px;left:100px;';
        document.body.appendChild(this.#physicsStats.dom);
        this.#scriptStats.showPanel(1);
        this.#scriptStats.dom.style.cssText = 'position:absolute;top:0px;left:180px;';
        document.body.appendChild(this.#scriptStats.dom);
        this.#graphicsStats.showPanel(1);
        this.#graphicsStats.dom.style.cssText = 'position:absolute;top:0px;left:260px;';
        document.body.appendChild(this.#graphicsStats.dom);

        requestAnimationFrame(this.update);
    }

    update(now: number) {
        const delta = now - this.#lastFrameTime;

        this.#stats.begin();

        if (this.#running) {
            this.#physicsStats.begin();
            physics.update();
            this.#physicsStats.end();

            this.#scriptStats.begin();
            for (const script of this.#gameScripts as any[]) {
                // script is being used as a component
                if ('update' in script) world.executeQuery([script.constructor], ([instance], e) => instance.update(e));
                // this is on everything
                if (script.every_frame) script.every_frame(delta);
            }
            this.#scriptStats.end();

            this.#graphicsStats.begin();
            graphics.update();
            this.#graphicsStats.end();
        }

        this.#stats.end();

        this.#lastFrameTime = now;

        requestAnimationFrame(this.update);
    }
}
