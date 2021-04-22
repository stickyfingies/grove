/**
 * System {
 *  constructor(engine) - defaulted, provides dependencies
 *  init() - called in appropriate order
 *  update() - fixed update, generic work
 *  ecs tasks...
 * }
 */

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

export default class Engine {
  running = false;

  #then = 0;

  #gameScripts: any[] = [];

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
      const script = await import(`./game/${scriptName}`);

      // eslint-disable-next-line new-cap
      const foo: any = new script.default(this);

      this.#gameScripts.push(foo);

      if ('init' in foo) {
        foo.init();
      }
    });

    // load the map
    const map = maps['test-arena'];
    map.objects.forEach((path) => {
      this.assetLoader.loadModel(path, (mesh) => {
        const body = AssetLoader.loadPhysicsModel(mesh, 0);
        new Entity(this.eManager)
          .setComponent(MeshData, mesh)
          .setComponent(PhysicsData, body);
      });
    });

    // </hack> this needs to be done in the player init script
    setTimeout(() => {
      Entity.getTag(this.eManager, 'player').getComponent(PhysicsData).position.set(map.spawn[0], map.spawn[1], map.spawn[2]);
    }, 500);

    // show performance statistics
    this.#stats.showPanel(1);
    document.body.appendChild(this.#stats.dom);

    requestAnimationFrame((time) => this.animate(time));
  }

  animate(now: number) {
    const delta = now - this.#then;

    this.#stats.begin();

    if (this.running) {
      // update physics
      this.physics.update(delta);

      // update game
      this.#gameScripts.forEach((script) => {
        if ('queries' in script && 'update' in script) {
          const task: Task = {
            execute(a, b) { script.update(a, b); },
            queries: script.queries,
          };
          this.eManager.executeTask(task, delta);
        } else if ('update' in script) {
          script.update();
        }
      });

      // update graphics
      this.graphics.update();
    }

    this.#stats.end();

    this.#then = now;

    requestAnimationFrame((time) => this.animate(time));
  }
}
