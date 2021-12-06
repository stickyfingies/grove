import EventEmitter from 'events';
import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import autoBind from 'auto-bind';
import { Quaternion as CQuaternion, Vec3 } from 'cannon-es';
import { Mesh, Quaternion, Vector3 } from 'three';

import AssetLoader from './load';
import Entity from './ecs/entity';
import EntityManager from './ecs/entity-manager';
import GameScript from './script';
import { Graphics, GraphicsData } from './graphics/graphics';
import { Physics, PhysicsData } from './physics';

import gameScripts from './game/_scripts.json';
import maps from './json/maps.json';

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

    #physicsStats = new Stats();

    #scriptStats = new Stats();

    #graphicsStats = new Stats();

    constructor() {
        autoBind(this);
    }

    async init() {
        Entity.defaultManager = this.ecs;

        this.events.on('startLoop', () => { this.#running = true; });
        this.events.on('stopLoop', () => { this.#running = false; });

        console.groupCollapsed('Initializing');

        this.graphics.init(this);
        await this.physics.init(this);
        this.assetLoader.init();

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

        const scriptModules: any[] = [];
        for (const scriptName of gameScripts.scripts) {
            scriptModules.push(import(`./game/${scriptName}`));
        }
        for (const scriptModule of await Promise.all(scriptModules)) {
            const script: GameScript = new scriptModule.default(this);
            this.#gameScripts.push(script);
            script.init();
        }

        // build graph
        // execute graph

        // load the map
        {
            const map = maps.skjarIsles;
            const meshPromise = await this.assetLoader.loadModel(map.path);
            // const physicsMesh = await this.assetLoader.loadModel(map.physicsPath);
            meshPromise.traverse((node) => {
                if (node instanceof Mesh) {
                    const worldPos = new Vector3();
                    const worldScale = new Vector3();
                    const worldQuat = new Quaternion();
                    node.getWorldPosition(worldPos);
                    node.getWorldScale(worldScale);
                    node.getWorldQuaternion(worldQuat);
                    const body = this.physics.createTrimesh({
                        pos: new Vec3(worldPos.x, worldPos.y, worldPos.z),
                        scale: new Vec3(worldScale.x, worldScale.y, worldScale.z),
                        quat: new CQuaternion(worldQuat.x, worldQuat.y, worldQuat.z, worldQuat.w),
                    }, node.geometry);

                    const f = new Entity();
                    f.setComponent(PhysicsData, body);
                    setTimeout(() => f.setComponent(GraphicsData, node), 500);
                }
            });
            // (await meshPromise).traverse((node) => {
            //     if (node instanceof Mesh) {
            //         const f = new Entity();
            //         f.setComponent(GraphicsData, node);
            //     }
            // });
        }

        // between the game scripts and the map, we probably just created a bunch of renderables.
        // run backend work now, so it isn't being done right when the first frame starts rendering.
        this.graphics.update();

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

        console.groupEnd();

        requestAnimationFrame(this.update);
    }

    update(now: number) {
        const delta = now - this.#lastFrameTime;

        this.#stats.begin();

        if (this.#running) {
            // step physics
            this.#physicsStats.begin();
            this.physics.update(delta);
            this.#physicsStats.end();

            // run per-frame game tasks
            this.#scriptStats.begin();
            for (const script of this.#gameScripts) script.update(delta);
            this.#scriptStats.end();

            // render scene
            this.#graphicsStats.begin();
            this.graphics.update();
            this.#graphicsStats.end();
        }

        this.#stats.end();

        this.#lastFrameTime = now;

        requestAnimationFrame(this.update);
    }
}
