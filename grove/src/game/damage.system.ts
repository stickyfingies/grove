import { EntityManager } from "@grove/ecs";
import HealthScript from "./health";

const callbackMap = new Map<number, Function[]>();

export function addDamageCallback(entity: number, callback: Function) {
    // frog__bones
    if (!callbackMap.has(entity)) {
        callbackMap.set(entity, []);
    }

    // add callback to entity's list
    callbackMap.get(entity)!.push(callback);
}

/**
 * @brief CURRIED FUNCTIONS BABYYY
 * Call me a functional programmer ;) except I'm dysfunctional :/
 */
export const dealDamage = (ecs: EntityManager) => (dmg: number) => (entity: number) => {
    const hasHealth = ecs.hasComponent(entity, HealthScript);
    if (hasHealth) {
        const [health] = ecs.getComponent(entity, [HealthScript]);
        health.hp -= dmg;
        // execute damage callbakcs
        for (const cb of callbackMap.get(entity) ?? []) {
            cb();
        }
    }
}