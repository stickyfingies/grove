import { EntityManager } from '@grove/ecs';
import { describe, test, expect } from 'vitest';

class HealthData {
    constructor(public hp: number, public max: number) { }
}

class DeathData {}

class HealthAPI {
    ecs: EntityManager;

    constructor(ecs: EntityManager) {
        this.ecs = ecs;
    }

    deal_damage(entity: number, damage: number) {
        const [health] = this.ecs.getComponent(entity, [HealthData]);
        health.hp -= damage;
        if (health.hp <= 0) {
            this.ecs.swapComponent(entity, [HealthData], [DeathData], [{}]);
        }
    }
}

describe('Entity interactions', () => {

    const ecs = new EntityManager();
    const health_api = new HealthAPI(ecs);
    const entity = ecs.createEntity();

    test.each([
        { hp: 10, damage: 3, after: 7 },
        { hp: 20, damage: 19, after: 1 },
    ])('Given an entity with $hp hp \t when it takes $damage damage \t then it has $after hp', ({ hp, damage, after }) => {
        // Given
        ecs.setComponent(entity, [HealthData], [new HealthData(hp, hp)]);
        // When
        health_api.deal_damage(entity, damage);
        // Then
        {
            const [health] = ecs.getComponent(entity, [HealthData]);
            expect(health.hp).toBe(after);
        }
    });

    test('Entities should die after suffering fatal wounds', () => {
        health_api.deal_damage(entity, 999);
        const alive = ecs.hasComponent(entity, HealthData);
        const dead = ecs.hasComponent(entity, DeathData);
        expect(alive).toBeFalsy();
        expect(dead).toBeTruthy();
    });
});