import { GUI } from 'dat.gui';
import autoBind from 'auto-bind';

import AssetLoader from './load';
import Engine from './engine';
import EntityManager from './ecs/entity-manager';
import { Graphics } from './graphics/graphics';
import { Physics } from './physics';

/**
 * Helper class for making core engine systems available to derived classes
 *
 * If `queries` **IS** set, `update()` gets called once per each game entity which contains all
 * components specified in `queries`, and recieves that entity as a paramenter.
 *
 * If `queries` **IS NOT** set, `update()` is only called once, and is not passed any entities.
 *
 * @note `GameScript` employs Sindresorhus' `autoBind()` in the constructor, meaning there's no need
 * to call `this.method.bind(this)` when passing methods as callbacks.
 *
 * @example
 * this.graphics.doSomething(); // no need for accessing engine directly
 * this.assetLoader.loadModel('/assets/foo', this.loadCallback); // no need for .bind()
 */
export default abstract class GameScript {
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
        autoBind(this);
    }

    /** @virtual */
    // eslint-disable-next-line class-methods-use-this, no-empty-function
    init(): void {}

    /** @virtual */
    // eslint-disable-next-line class-methods-use-this, no-empty-function
    update(dt: number): void {}
}
