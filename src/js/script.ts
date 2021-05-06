import { GUI } from 'dat.gui';
import Engine from './engine';
import EntityManager from './ecs/entity-manager';
import { Graphics } from './graphics/graphics';
import AssetLoader from './load';
import { Physics } from './physics';

/**
 * Helper class for making core engine systems available to derived classes
 *
 * If `queries` **IS** set, `update()` gets called once per each game entity which contains all
 * components specified in `queries`, and recieves that entity as a paramenter.
 *
 * If `queries` **IS NOT** set, `update()` is only called once, and is not passed any entities.
 *
 * @example
 * // old code:
 * this.engine.graphics.doStuff();
 * // with GameScript:
 * this.graphics.doStuff();
 */
export default class GameScript {
  graphics: Graphics;

  physics: Physics;

  ecs: EntityManager;

  gui: GUI;

  assetLoader: AssetLoader;

  constructor(protected engine: Engine) {
    this.graphics = engine.graphics;
    this.physics = engine.physics;
    this.ecs = engine.ecs;
    this.gui = engine.gui;
    this.assetLoader = engine.assetLoader;
  }

  /** @virtual */
  // eslint-disable-next-line class-methods-use-this, no-empty-function
  init() {}

  /** @virtual */
  // eslint-disable-next-line class-methods-use-this, no-empty-function
  update(dt: number) {}
}
