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

    #physicsStats = new Stats();

    #scriptStats = new Stats();

    #graphicsStats = new Stats();

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

        const physics_ready = physics.init(world.events, LogService('physics'), LogService('physics:worker'));
        graphics.init();
        assetLoader.init(LogService('load'));
        // await physics_ready;
        world.events.on(`set${PhysicsData.name}Component`, ({ entity_id, data }) => {
            // ! using `physics.ts` internals inside `engine.ts` ? preposterous !
            // Move this down to the physics API surface
            data.setUserIndex(entity_id);
        });
        world.events.on(`delete${PhysicsData.name}Component`, ({ data }) => {
            physics.removeBody(data);
        });

        // create camera
        new Entity(world)
            .addTag(CAMERA_TAG)
            .setComponent(CameraData, graphics.camera);

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

    /**
     * Takes a `GameScript[]` and initializes them.
     * 
     * Also registers `GameScript`s to have their `every_frame(dt)` function
     * called every frame.
     */
    attachModules(scripts: GameSystem[]) {
        this.#gameScripts = this.#gameScripts.concat(scripts);
        scripts.forEach(script => { if ('initialize' in script) script.initialize() });
    }

    update(now: number) {
        const delta = now - this.#lastFrameTime;

        this.#stats.begin();

        if (this.#running) {
            this.#physicsStats.begin();
            physics.update(delta);
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
