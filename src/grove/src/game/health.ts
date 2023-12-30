import { world } from '@grove/engine';

/**
 * Anything with a health component is alive.  When `health.hp <= 0`, the
 * HealthData component is removed, and replaced with a DeathData component.
 */
export class Health {
    constructor(
        public hp: number = 1,
        public max: number = 2
    ) { }
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
export class Death { }

/**
 * Delta: (-Health, +Death)
 */
world.addRule({
    name: 'Dead things die',
    types: [Health],
    fn([health], entity) {
        health.hp = Math.min(health.hp, health.max);
        if (health.hp <= 0) {
            world.swapComponent(entity, [Health], [Death], [{}]);
        }
    }
});