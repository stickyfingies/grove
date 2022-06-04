import { GUI } from 'dat.gui';
import autoBind from 'auto-bind';

import AssetLoader from './load';
import Engine from './engine';
import EntityManager from './ecs/entity-manager';
import { Graphics } from '3-AD';
import { Physics } from 'firearm';

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
 * document.addEventListener('click', this.doSomething); // no need for .bind()
 */
export default abstract class GameScript {
    readonly physics: Physics;

    readonly ecs: EntityManager;

    readonly gui: GUI;

    readonly assetLoader: AssetLoader;

    readonly graphics: Graphics;

    constructor(protected engine: Engine) {
        this.physics = engine.physics;
        this.ecs = engine.ecs;
        this.gui = engine.gui;
        this.assetLoader = engine.assetLoader;
        this.graphics = engine.graphics;
        autoBind(this);
    }

    /** @virtual */
    init(): void {}

    /** @virtual */
    update(_dt: number): void {}
}
