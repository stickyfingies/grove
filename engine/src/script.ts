import autoBind from 'auto-bind';
import { world } from './engine';

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
 * graphics.doSomething(); // no need for accessing engine directly
 * document.addEventListener('click', this.doSomething); // no need for .bind()
 */
export abstract class GameSystem {
    id: number;

    constructor(id?: number, data?: any) {
        this.id = id ?? world.createEntity();
        if (data) Object.assign(this, data);

        autoBind(this);
    }

    /** @virtual */
    initialize(): void {}

    /** @virtual */
    every_frame(_dt: number): void {}
}
