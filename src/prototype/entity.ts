import { ComponentType } from "../ecs/entity-manager";
import { GameSystem, GameSystemInterface } from "../script";

export class Component extends GameSystem {
    constructor(engine: GameSystemInterface, public id: number, public data: any) {
        super(engine);
        if (id && data)
    }

    create(d: any) {}

    getComponent<T>(type: ComponentType<T>): T {
        return world.getComponent(this.id, type);
    }

    setComponent<T>(type: ComponentType<T>, data: T) {
        world.setComponent(this.id, type, data);
    }
}