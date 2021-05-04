import { Entity } from '../entities';
import GameScript from '../script';

/**
 * Anything with a health component is alive.  Death is signified by removing the health component.
 */
export class HealthData {
  /** current hp value */
  hp: number;

  /** maximum hp value */
  max: number;
}

export default class HealthScript extends GameScript {
  queries = new Set([HealthData])

  // eslint-disable-next-line class-methods-use-this
  update(dt: number, entity: Entity) {
    const health = entity.getComponent(HealthData);

    // cap hp value at max hp value
    health.hp = Math.min(health.hp, health.max);

    // this hoe dead
    if (health.hp <= 0) {
      entity.deleteComponent(HealthData);
    }
  }
}
