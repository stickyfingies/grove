import Entity from './entity';
import EntityManager, { ComponentSignature } from './entity-manager';

/**
 * Utility for calling `IEntityManager.submitQuery` which wraps the IDs in `Entity` objects
 */
export default class EcsView {
    /** Entity manager to iterate over */
    readonly ecs: EntityManager;

    /** Signature to check entities for */
    readonly signature: ComponentSignature;

    constructor(ecs: EntityManager, signature: ComponentSignature) {
        world = ecs;
        this.signature = signature;
    }

    /** Execute a callback for every entity that matches signature */
    iterateView(callback: (e: Entity) => void) {
        const ids = world.submitQuery(Array.from(this.signature));
        for (const id of ids) callback(new Entity(world, id));
    }
}
