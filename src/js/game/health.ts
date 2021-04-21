/**
 * Death is signified by removing the health component
 */

import { eManager, Task } from '../entities';

export class HealthData {
  hp: {
      value: number,
      max: number
  }
}

const healthTask: Task = (_, [health]: [HealthData], entity: number) => {
  if (health.hp.value <= 0) {
    eManager.deleteComponent(entity, HealthData);
  }
};
healthTask.queries = new Set([HealthData]);

export const tasks = [healthTask];
