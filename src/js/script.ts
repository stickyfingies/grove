import { GUI } from 'dat.gui';
import Engine from './engine';
import { ComponentSignature, Entity, EntityManager } from './entities';
import { Graphics } from './graphics/graphics';
import AssetLoader from './load';
import { Physics } from './physics';

/**
 * Helper class for making core engine systems available to derived classes
 *
 * If `queries` is set, `update()` gets called once per each game entity which contains all
 * components specified in `queries`, and recieves that entity as a paramenter.
 *
 * If `queries` is NOT set, `update()` is only called once, and is not passed any entities.
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

  queries?: ComponentSignature;

  constructor(protected engine: Engine) {
    this.graphics = engine.graphics;
    this.physics = engine.physics;
    this.ecs = engine.ecs;
    this.gui = engine.gui;
    this.assetLoader = engine.assetLoader;
  }

  // eslint-disable-next-line class-methods-use-this, no-empty-function
  init() {}

  // eslint-disable-next-line class-methods-use-this, no-empty-function
  update(dt: number, entity?: Entity) {}
}
