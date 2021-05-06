import Entity from './entity';
import EntityManager, { ComponentSignature } from './entity-manager';

/**
 * Utility for calling `IEntityManager.submitQuery` which wraps the IDs in `Entity` objects
 */
export default class EcsView {
  /** Entity manager to iterate over */
  #ecs: EntityManager;

  /** Signature to check entities for */
  #signature: ComponentSignature;

  constructor(ecs: EntityManager, signature: ComponentSignature) {
    this.#ecs = ecs;
    this.#signature = signature;
  }

  /** Execute a callback for every entity that matches signature */
  iterateView(callback: (e: Entity) => void) {
    const ids = this.#ecs.submitQuery(this.#signature);

    ids.forEach((id) => callback(new Entity(this.#ecs, id)));
  }
}
