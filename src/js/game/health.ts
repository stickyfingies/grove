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
        this.healthView.iterateView((entity) => {
            const health = entity.getComponent(HealthData);

            // cap hp value at max hp value
            health.hp = Math.min(health.hp, health.max);

            // this hoe dead
            if (health.hp <= 0) {
                entity.deleteComponent(HealthData);
            }
        });
    }
}
