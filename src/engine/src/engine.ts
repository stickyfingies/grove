import EventEmitter from 'events';
import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import autoBind from 'auto-bind';

import AssetLoader from './load';
import { Entity, EntityManager } from '@grove/ecs';
import LogService from './log';
import { GameSystem } from './script';
import {
    CAMERA_TAG,
    CameraData,
    Graphics,
} from '@grove/graphics';
import { PhysicsData, start_physics_engine } from '@grove/physics';

export const gui = new GUI();
export const graphics = new Graphics(LogService('graphics'), LogService('graphics:worker'));
export const physics = await start_physics_engine(LogService('physics')[0]);
export const assetLoader = new AssetLoader();

/// for things that live in the world
export const world = new EntityManager();

export const events = new EventEmitter();

export default class Engine {
    #running = false;

    #lastFrameTime = 0;

    #gameScripts: GameSystem[] = [];

    #stats = new Stats();

    constructor() {
        autoBind(this);
    }

    async init() {
        const [log, report] = LogService('engine');
        // @ts-ignore - Useful for debugging
        window.log = log;
        // @ts-ignore - Useful for debugging
        window.report = report;

        Entity.defaultManager = world;

        events.on('startLoop', () => { this.#running = true; });
        events.on('stopLoop', () => { this.#running = false; });

        physics.init(world.events);
        graphics.init();
        assetLoader.init(LogService('load'));
        
        world.useEffect({
            type: PhysicsData,
            add(entity, data) {
                data.setUserIndex(entity);
            },
            remove(entity, data) {
                physics.removeBody(data);
            }
        });

        // create camera
        const camera = world.spawn([CameraData], [graphics.camera]);
        world.addTag(camera, CAMERA_TAG);

        // between the game scripts and the map, we probably just created a bunch of renderables.
        // run backend work now, so it isn't being done right when the first frame starts rendering.
        graphics.update();

        // show performance statistics
        this.#stats.showPanel(1);
        this.#stats.dom.style.cssText = 'position:absolute;top:0px;left:100px;';
        document.body.appendChild(this.#stats.dom);
        // this.#physicsStats.showPanel(1);
        // this.#physicsStats.dom.style.cssText = 'position:absolute;top:0px;left:100px;';
        // document.body.appendChild(this.#physicsStats.dom);
        // this.#scriptStats.showPanel(1);
        // this.#scriptStats.dom.style.cssText = 'position:absolute;top:0px;left:180px;';
        // document.body.appendChild(this.#scriptStats.dom);
        // this.#graphicsStats.showPanel(1);
        // this.#graphicsStats.dom.style.cssText = 'position:absolute;top:0px;left:260px;';
        // document.body.appendChild(this.#graphicsStats.dom);

        gui.add({
            copyMermaid() {
                navigator.clipboard.writeText(world.mermaid);
            }
        }, 'copyMermaid');

        requestAnimationFrame(this.update);
    }

    /**
     * Takes a `GameScript[]` and initializes them.
     * 
     * Also registers `GameScript`s to have their `every_frame(dt)` function
     * called every frame.
     */
    attachModules(scripts: GameSystem[]) {
        this.#gameScripts = this.#gameScripts.concat(scripts);
        scripts.forEach(script => { if ('initialize' in script) script.initialize(); });
    }

    update(now: number) {
        const delta = now - this.#lastFrameTime;

        this.#stats.begin();

        if (this.#running) {
            physics.update(delta);

            for (const script of this.#gameScripts as any[]) {
                // script is being used as a component
                if ('update' in script) world.do_with([script.constructor], ([instance], e) => instance.update(e));
                // this is on everything
                if (script.every_frame) script.every_frame(delta);
            }

            world.executeRules();
            
            graphics.update();    
        }

        this.#stats.end();

        this.#lastFrameTime = now;

        requestAnimationFrame(this.update);
    }

    /**
     * Used with `import.meta.glob` to dynamically load and run scripts
     */
    async run_scripts(scriptConfig: ScriptConfig) {

        const gameSystems: GameSystem[] = [];

        scriptConfig.typescript ??= [];
        scriptConfig.webassembly ??= [];

        for (const glob of scriptConfig.typescript) {
            console.groupCollapsed('typescript');
            const modules = await loadModules(glob);
            const systems = modules.map(({ module }) => new (module as any).default() as GameSystem);
            systems.forEach((system) => gameSystems.push(system));
            console.groupEnd();
        }

        for (const glob of scriptConfig.webassembly) {
            console.groupCollapsed('webassembly');
            const modules = await loadModules(glob);
            const systems = modules.map(({ module }) => (module as any).default() as GameSystem);
            systems.forEach((system) => gameSystems.push(system));
            console.groupEnd();
        }

        const systems: GameSystem[] = await Promise.all(gameSystems);
        this.attachModules(systems);
    }
}

/**
 * @example import.meta.glob("src/*.ts");
 */
type ImportMetaGlob = Record<string, () => Promise<NodeModule>>;
// type F = (ValueT<ImportMeta>)
export type ScriptConfig = {
    typescript: ReadonlyArray<ImportMetaGlob> | undefined;
    webassembly: ReadonlyArray<ImportMetaGlob> | undefined;
};

// **Import Code**
// { filepath->fn() } -> { filepath->module }
async function loadModules(glob: ImportMetaGlob) {
    const modules = await Promise.all(Object
        .entries(glob)
        .map(async ([path, loadModule]) => {

            const filepath = path.split('/').pop();
            const filename = filepath!.split('.')[0]!;

            try {
                const module = await loadModule();
                // console.log(filename + ' - ' + Object.keys(module).join(', '));
                return { filename, module } as const;
            } catch (err) {
                console.error("Failed to load file " + filepath);
                console.trace(err);
                return { filename, module: {} } as const;
            }

        }));

    return modules.filter(({ module }) => 'default' in module);
}
