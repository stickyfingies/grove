import EcsView from '../ecs/view';
import GameScript from '../script';

/**
 * Anything with a health component is alive.  Death is signified by removing the health component.
 */
export class HealthData {
    /** current hp value */
    hp: number = 1;

    /** maximum hp value */
    max: number = 1;
}

export default class HealthScript extends GameScript {
    healthView = new EcsView(this.ecs, new Set([HealthData]));

    update() {
        const entitiesToKill: number[] = [];

        this.ecs.executeQuery([HealthData], ([health], entity) => {
            // cap hp value at max hp value
            health.hp = Math.min(health.hp, health.max);

            if (!health) console.log('fuck');

            // this hoe dead
            if (health.hp <= 0) {
                entitiesToKill.push(entity);
            }
        });

        for (const entity of entitiesToKill) {
            this.ecs.deleteComponent(entity, HealthData);
        }
    }
}
