import { world } from '../engine';

/**
 * Anything with a health component is alive.  When `health.hp <= 0`, the
 * HealthData component is removed, and replaced with a DeathData component.
 */
export interface HealthData {
    /** current hp value */
    hp: number;
    /** maximum hp value */
    max: number;
}

/**
 * This component signifies that an entity was once alive, but is now dead.
 * @example
 * ```ts
 * // query for dead amphibians
 * const deadFrogs = world.submitQuery(new Set([FrogData, DeathData]));
 * for (const corpse of deadFrogs) {
 *      console.log('rip...');
 * }
 * ```
 */
export class DeathData { }

export default class HealthScript {
    static bahavior = (hp: number, max: number) => () => new HealthScript(hp, max);

    constructor(
        public hp: number = 1,
        public max: number = 2
    ) { }

    update(e: number) {
        this.hp = Math.min(this.hp, this.max);
        if (this.hp <= 0) {
            world.deleteComponent(e, HealthScript);
            world.setComponent(e, DeathData, {});
        }
    }
}
