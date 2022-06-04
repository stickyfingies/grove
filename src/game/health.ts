import GameScript from '../script';

/**
 * Anything with a health component is alive.  When `health.hp <= 0`, the
 * HealthData component is removed, and replaced with a DeathData component.
 */
export class HealthData {
    /** current hp value */
    hp: number = 1;

    /** maximum hp value */
    max: number = 1;
}

/**
 * This component signifies that an entity was once alive, but is now dead.
 * @example
 * ```ts
 * // query for dead amphibians
 * const deadFrogs = this.ecs.submitQuery(new Set([FrogData, DeathData]));
 * for (const corpse of deadFrogs) {
 *      console.log('rip...');
 * }
 * ```
 */
export class DeathData { }

export default class HealthScript extends GameScript {
    update() {
        /// entities which should be marked as 'dead' this frame
        const entitiesToKill: number[] = [];

        this.ecs.executeQuery([HealthData], ([health], entity) => {
            // cap hp value at max hp value
            health.hp = Math.min(health.hp, health.max);

            if (!health) console.error('fuck');

            // this hoe dead
            if (health.hp <= 0) {
                entitiesToKill.push(entity);
            }
        });

        for (const entity of entitiesToKill) {
            this.ecs.deleteComponent(entity, HealthData);
            this.ecs.setComponent(entity, DeathData, {});
        }
    }
}
