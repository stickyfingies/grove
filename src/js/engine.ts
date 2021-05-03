import { DefaultLoadingManager } from 'three';
import $ from 'jquery';
// @ts-ignore
import Stats from 'stats-js';
import { GUI } from 'dat.gui';
import AssetLoader from './load';
import { Graphics, MeshData } from './graphics/graphics';
import { Physics, PhysicsData } from './physics';
import { Entity, EntityManager, Task } from './entities';

import maps from './json/maps.json';
import gameScripts from './game/_scripts.json';
import GameScript from './script';

/**
 * Engine state is kept as a component inside a tagged 'engine' entity.
 * This signifies a shift in the scope of the entity system - by using it as a
 * single source of truth for all game state.
 *
 * ? is this a good idea?
 *
 * pros: game subsystems are decoupled from the engine - just grab engine data from the ecs
 * cons: that wasn't really the original purpose of the ecs, and it's not optimized for that usage
 *
 * original aim of ecs: unified means of dealing with GAME OBJECTS.
 * how its being used now: single store for all game / engine state
 */

export default class Engine {
  running = false;

  #lastFrameTime = 0;

  #gameScripts: GameScript[] = [];

  #stats = new Stats();

  #gui = new GUI();

  #graphics = new Graphics();

  #physics = new Physics();

  #assetLoader = new AssetLoader();

  #eManager = new EntityManager();

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

  get eManager() {
    return this.#eManager;
  }

  init() {
    Entity.defaultManager = this.eManager;

    // initialize engine systems
    this.graphics.init(this);
    this.physics.init(this);

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
          .setComponent(MeshData, mesh)
          .setComponent(PhysicsData, body);
      });
    });

    // </hack> this needs to be done in the player init script / scene loading
    setTimeout(() => {
      Entity
        .getTag('player')
        .getComponent(PhysicsData)
        .position
        .set(map.spawn[0], map.spawn[1], map.spawn[2]);
    }, 500);

    // show performance statistics
    this.#stats.showPanel(1);
    document.body.appendChild(this.#stats.dom);

    requestAnimationFrame((time) => this.animate(time));
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
          const task: Task = {
            execute: script.update.bind(script),
            queries: script.queries!,
          };
          this.eManager.executeTask(task, delta);
        } else {
          script.update();
        }
      });

      // update graphics
      this.graphics.update();
    }

    this.#stats.end();

    this.#lastFrameTime = now;

    requestAnimationFrame((time) => this.animate(time));
  }
}
