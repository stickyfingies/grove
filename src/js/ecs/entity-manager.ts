import EventEmitter from 'events';

/** Anything that's a DataType is a class */
export interface DataType<T = any> {
  new(...args: any[]): T;
}

export type ComponentSignature = Set<DataType>;

const areSetsEqual = <T>(setA: Set<T>, setB: Set<T>) => {
  let equal = setA.size === setB.size;
  for (const value of setA) {
    if (!setB.has(value)) {
      equal = false;
      break;
    }
  }
  return equal;
};

/**
 * Component storage.  Thin wrapper over a `Map`
 */
class DataManager {
    components = new Map<number, any>();

    setComponent(entity: number, data: any): void {
      this.components.set(entity, data);
    }

    getComponent(entity: number): any {
      return this.components.get(entity)!;
    }

    hasComponent(entity: number): boolean {
      return this.components.has(entity);
    }

    deleteComponent(entity: number): boolean {
      return this.components.delete(entity);
    }
}

// TODO document this class
class Archetype {
  constructor(public signature: ComponentSignature, public entities: Set<number>) {}

  /** Check if this archetype contains at LEAST all the component types listed in `query` */
  containsSignature(query: ComponentSignature) {
    let matches = true;

    for (const type of query) {
      if (!this.signature.has(type)) {
        matches = false;
        break;
      }
    }

    return matches;
  }
}

/**
 * TODO add events for updating a component.
 * I think this could be implemented by making `getComponent()` return a copy of the internal data,
 * and then using `setComponent` to override the internal state with the new state - very functional
 * approach.
 */
export default class EntityManager {
    /**
     * Event bus for signalling when components are set / deleted
     * @eventProperty
     */
    #events = new EventEmitter();

    /** Map from tags to entities */
    #tagList = new Map<symbol, number>();

    /** Map between component type and component storage */
    #dataManagers = new Map<DataType, DataManager>();

    /** Next available entity ID */
    #entityId = 0;

    /** Map between entity ID and its corresponding archetype */
    #idToArchetype = new Map<number, Archetype>();

    /**
     * List of entity archetypes
     * TODO document archetypes
     */
    #archetypes: Archetype[] = [];

    get events() {
      return this.#events;
    }

    /** Allocate an ID for a new entity */
    createEntity() {
      const id = this.#entityId;
      this.#entityId += 1;
      return id;
    }

    /** Delete an entity and all its component data */
    deleteEntity(id: number) {
      const archetype = this.#idToArchetype.get(id)!;

      // emit 'delete' events for every component in this entity
      for (const type of archetype.signature) {
        this.events.emit(`delete${type.name}Component`, id, this.getComponent(id, type));
        this.#dataManagers.get(type)?.deleteComponent(id);
      }

      archetype.entities.delete(id);

      this.#idToArchetype.delete(id);
    }

    /** Set a component for an entity */
    setComponent<T>(id: number, type: DataType<T>, data: T) {
      // assign to new entity archetype
      const signature = new Set(this.#idToArchetype.get(id)?.signature);
      signature.add(type);
      this.refreshArchetype(id, signature);

      // lazily initialize data manager
      if (!this.#dataManagers.has(type)) {
        this.#dataManagers.set(type, new DataManager());
      }

      // set the component (BEFORE event)
      this.#dataManagers.get(type)?.setComponent(id, data);

      // emit a `set` event
      this.events.emit(`set${type.name}Component`, id, data);
    }

    /** Delete a component for an entity */
    deleteComponent(id: number, type: DataType) {
      // assign to new entity archetype
      const signature = new Set(this.#idToArchetype.get(id)?.signature);
      signature.delete(type);
      this.refreshArchetype(id, signature);

      // lazily initialize data manager
      if (!this.#dataManagers.has(type)) {
        console.warn(`component type ${type.name} is not registered`);
        this.#dataManagers.set(type, new DataManager());
      }

      // emit a `delete` event
      this.events.emit(`delete${type.name}Component`, id, this.getComponent(id, type));

      // delete the component (AFTER event)
      this.#dataManagers.get(type)?.deleteComponent(id);
    }

    /** Get a component from an entity */
    getComponent<T>(id: number, type: DataType<T>): T {
      // lazily initialize data manager
      if (!this.#dataManagers.has(type)) {
        console.error(`component type ${type.name} is not registered`);
        this.#dataManagers.set(type, new DataManager());
      }

      return this.#dataManagers.get(type)?.getComponent(id)!;
    }

    /** Check if an entity has a component */
    hasComponent(id: number, type: DataType): boolean {
      // lazily initialize data manager
      if (!this.#dataManagers.has(type)) {
        console.warn(`component type ${type.name} is not registered`);
        this.#dataManagers.set(type, new DataManager());
      }

      return this.#dataManagers.get(type)?.hasComponent(id)!;
    }

    /** Add a tag to an entity.  Entities can later be retrieved using the same tag */
    addTag(id: number, tag: symbol) {
      this.#tagList.set(tag, id);
    }

    /** Get a specific entity by its tag */
    getTag(tag: symbol) {
      if (!this.#tagList.has(tag)) {
        console.error(`no entity found with tag:${tag.description}`);
      }

      return this.#tagList.get(tag)!;
    }

    /** Get a list of all entity id's which match a component signature */
    submitQuery(query: ComponentSignature) {
      const entities: number[] = [];

      // add entity ID's from archetypes that match signature
      for (const [id, arch] of this.#idToArchetype) {
        if (arch.containsSignature(query)) entities.push(id);
      }

      return entities!;
    }

    // TODO document this
    private refreshArchetype(id: number, signature: ComponentSignature) {
      // component signature changed; remove affiliations with any old archetypes
      this.#idToArchetype.get(id)?.entities.delete(id);
      this.#idToArchetype.delete(id);

      let entityInArchetype = false;

      // we should attempt to add this entity to an existing archetype
      // it's more than likely that one already exists
      for (const arch of this.#archetypes) {
        if (areSetsEqual(arch.signature, signature)) {
          entityInArchetype = true;
          this.#idToArchetype.set(id, arch);
          arch.entities.add(id);
        }
      }

      // if we couldn't find an archetype that matches this entity's list of components,
      // create one that contains this entity
      if (!entityInArchetype) {
        const arch = new Archetype(new Set(signature), new Set([id]));
        this.#archetypes.push(arch);
        this.#idToArchetype.set(id, arch);
      }
    }
}
