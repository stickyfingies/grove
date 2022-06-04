import Entity from './entity';
import EntityManager, { Signature } from './entity-manager';

/**
 * Utility for calling `IEntityManager.submitQuery` which wraps the IDs in `Entity` objects
 */
export default class EcsView {
    /** Entity manager to iterate over */
    readonly ecs: EntityManager;

    /** Signature to check entities for */
    readonly signature: Signature;

    constructor(ecs: EntityManager, signature: Signature) {
        this.ecs = ecs;
        this.signature = signature;
    }

    /** Execute a callback for every entity that matches signature */
    iterateView(callback: (e: Entity) => void) {
        const ids = this.ecs.submitQuery(Array.from(this.signature));
        for (const id of ids) callback(new Entity(this.ecs, id));
    }
}
