import { DefaultLoadingManager, Cache } from 'three';
// @ts-ignore
import Stats from 'stats-js';
import { GUI } from 'dat.gui';
import autoBind from 'auto-bind';
import AssetLoader from './load';
import { Graphics, GraphicsData } from './graphics/graphics';
import { Physics, PhysicsData } from './physics';
import Entity from './ecs/entity';
import EntityManager from './ecs/entity-manager';

import maps from './json/maps.json';
import gameScripts from './game/_scripts.json';
import GameScript from './script';

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
  get gui() {
    return this.#gui;
  }

  /** Convenience method */
  get graphics() {
    return this.#graphics;
  }

  /** Convenience method */
  get physics() {
    return this.#physics;
  }

  /** Convenience method */
  get assetLoader() {
    return this.#assetLoader;
  }

  /** Convenience method */
  get ecs() {
    return this.#ecs;
  }

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

    // load game scripts
    const scriptModules: any[] = [];
    for (const scriptName of gameScripts.scripts) {
      scriptModules.push(import(`./game/${scriptName}`));
    }

    // init game scripts
    for (const scriptModule of await Promise.all(scriptModules)) {
      const script: GameScript = new scriptModule.default(this); // eslint-disable-line new-cap
      this.#gameScripts.push(script);
      script.init();
    }

    // load the map
    const map = maps['test-arena'];
    for (const path of map.objects) {
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
      // update physics
      this.physics.update(delta);

      // update game
      for (const script of this.#gameScripts) script.update(delta);

      // update graphics
      this.graphics.update();
    }

    this.#stats.end();

    this.#lastFrameTime = now;

    requestAnimationFrame(this.update);
  }
}
