import { DefaultLoadingManager } from 'three';
import $ from 'jquery';
// @ts-ignore
import Stats from 'stats-js';
import { GUI } from 'dat.gui';
import AssetLoader from './load';
import { Graphics, GraphicsData } from './graphics/graphics';
import { Physics, PhysicsData } from './physics';
import { Entity, EntityManager } from './entities';

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

  /**
   * Getters for game scripts
   */

  get gui() {
    return this.#gui;
  }

  get graphics() {
    return this.#graphics;
  }

  get physics() {
    return this.#physics;
  }

  get assetLoader() {
    return this.#assetLoader;
  }

  get ecs() {
    return this.#ecs;
  }

  init() {
    Entity.defaultManager = this.ecs;

    // initialize engine systems
    this.graphics.init(this);
    this.physics.init(this);

    // TODO move `onProgress` into AssetLoader, and UI into a game script
    // show asset loading progress
    DefaultLoadingManager.onProgress = (url, loaded, total) => {
      console.log(`${url} (${loaded}/${total})`);
      if (loaded === total) {
        $('#spinner').hide();
        $('#load-play-btn, .play-btn').show();
      }
    };

    // load game scripts
    gameScripts.scripts.forEach(async (scriptName) => {
      const scriptModule = await import(`./game/${scriptName}`);

      // eslint-disable-next-line new-cap
      const script: GameScript = new scriptModule.default(this);

      this.#gameScripts.push(script);

      script.init();
    });

    // load the map
    const map = maps['test-arena'];
    map.objects.forEach((path) => {
      this.assetLoader.loadModel(path, (mesh) => {
        const body = AssetLoader.loadPhysicsModel(mesh, 0);
        new Entity()
          .setComponent(GraphicsData, mesh)
          .setComponent(PhysicsData, body);
      });
    });

    // show performance statistics
    this.#stats.showPanel(1);
    document.body.appendChild(this.#stats.dom);

    requestAnimationFrame(this.animate.bind(this));
  }

  animate(now: number) {
    const delta = now - this.#lastFrameTime;

    this.#stats.begin();

    if (this.running) {
      // update physics
      this.physics.update(delta);

      // update game
      this.#gameScripts.forEach((script) => {
        if ('queries' in script) {
          this.ecs.executeTask({
            execute: script.update.bind(script),
            queries: script.queries!,
          }, delta);
        } else {
          script.update();
        }
      });

      // update graphics
      this.graphics.update();
    }

    this.#stats.end();

    this.#lastFrameTime = now;

    requestAnimationFrame(this.animate.bind(this));
  }
}
