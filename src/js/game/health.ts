/**
 * Death is signified by removing the health component
 */

import { Entity } from '../entities';
import GameScript from '../script';

export class HealthData {
  hp: {
      value: number,
      max: number
  }
}

export default class HealthScript extends GameScript {
  queries = new Set([HealthData])

  // eslint-disable-next-line class-methods-use-this
  update(dt: number, entity: Entity) {
    const health = entity.getComponent(HealthData);

    health.hp.value = Math.min(health.hp.value, health.hp.max);

    if (health.hp.value <= 0) {
      entity.deleteComponent(HealthData);
    }
  }
}
