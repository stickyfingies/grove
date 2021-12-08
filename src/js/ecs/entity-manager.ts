import EventEmitter from 'events';

/** Anything that's a ComponentType is a class */
export interface ComponentType<T = any> {
  new(...args: any[]): T;
}

/** A component signature is a set of the types of components something's interested in */
export type ComponentSignature = Set<ComponentType>;

export type ComponentQuery = ComponentType[];

export type ComponentArgs = [ComponentType] | ComponentType[];

/** See https://dev.t-matix.com/blog/platform/eimplementing-a-type-saf-ecs-with-typescript/ */
type ComponentArgsFromQuery<T> = {
    [P in keyof T]: T[P] extends ComponentType
        ? InstanceType<T[P]>
        : never
}

/** Component storage type.  Maps entity id -> component instance */
type ComponentStore = Map<number, InstanceType<ComponentType>>;

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
 * Archetypes store the actual component data for entities.
 *
 * There is one archetype per component signature.  That means, all entities with the same
 * signature have their components stored in the same archetype.
 *
 * This makes it easy to query for all entities that match a component signature - just query
 * each archetype, and if the archetype matches the signature, then all entities in that archetype
 * will match the signature as well.
 */
class Archetype {
    signature: ComponentSignature;

    entities: Set<number>;

    components = new Map<ComponentType, ComponentStore>();

    constructor(signature: ComponentSignature, entities: Set<number>) {
        this.signature = signature;
        this.entities = entities;

        this.signature.forEach((componentType) => {
            this.components.set(componentType, new Map());
        });
    }

    addEntity(id: number) {
        this.entities.add(id);
    }

    removeEntity(id: number) {
        this.entities.delete(id);
        this.components.forEach((store) => {
            store.delete(id);
        });
    }

    /** Check if this archetype has EXACTLY the same component types listed in `signature` */
    matchesSignature(signature: ComponentSignature) {
        return areSetsEqual(this.signature, signature);
    }

    /** Check if this archetype contains AT LEAST all the component types listed in `query` */
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
 *
 * I think this could be implemented by making `getComponent()` return a copy of the internal data,
 * and then using `setComponent` to override the internal state with the new state - very functional
 * approach.
 */
export default class EntityManager {
    /**
     * Event bus for signalling when components are set / deleted
     * @eventProperty
     */
    readonly events = new EventEmitter();

    /** Map from tags to entities */
    #tagList = new Map<symbol, number>();

    /** Next available entity ID */
    #entityId = 0;

    /** Map between entity ID and its corresponding archetype */
    #idToArchetype = new Map<number, Archetype>();

    /**
     * List of entity archetypes
     * TODO document archetypes
     */
    #archetypes: Archetype[] = [];

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
            archetype.components.get(type)?.delete(id);
        }

        archetype.entities.delete(id);

        this.#idToArchetype.delete(id);
    }

    /** Set a component for an entity */
    setComponent<T>(id: number, type: ComponentType<T>, data: T) {
        // calclulate new signature for this entity
        const signature = new Set(this.#idToArchetype.get(id)?.signature);
        signature.add(type);

        // move entity into its new archetype
        this.updateEntityArchetype(id, signature);

        const archetype = this.#idToArchetype.get(id)!;

        // the new archetype should have a store for the new component type
        if (!archetype.components.has(type)) {
            throw new Error('This should never happen.');
        }

        // set the component (BEFORE event)
        archetype.components.get(type)?.set(id, data);

        // emit a `set` event
        this.events.emit(`set${type.name}Component`, id, data);
    }

    /** Delete a component for an entity.  Returns whether the component was deleted */
    deleteComponent(id: number, type: ComponentType) {
        // assign to new entity archetype
        const signature = new Set(this.#idToArchetype.get(id)?.signature);
        signature.delete(type);
        this.updateEntityArchetype(id, signature);

        const archetype = this.#idToArchetype.get(id)!;

        // emit a `delete` event
        this.events.emit(`delete${type.name}Component`, id, this.getComponent(id, type));

        // delete the component (AFTER event)
        return archetype.components.get(type)?.delete(id) ?? false;
    }

    /** Get a component from an entity */
    getComponent<T>(id: number, type: ComponentType<T>): T {
        const archetype = this.#idToArchetype.get(id)!;

        // lazily initialize data manager
        if (!archetype.components.has(type)) {
            throw new Error(`component type ${type.name} is not registered`);
        }

        return archetype.components.get(type)?.get(id)!;
    }

    /** Check if an entity has a component */
    hasComponent(id: number, type: ComponentType): boolean {
        const archetype = this.#idToArchetype.get(id)!;

        // lazily initialize data manager
        if (!archetype.components.has(type)) {
            return false;
        }

        return archetype.components.get(type)?.has(id)!;
    }

    /** Add a tag to an entity.  Entities can later be retrieved using the same tag */
    addTag(id: number, tag: symbol) {
        this.#tagList.set(tag, id);
    }

    /** Get a specific entity by its tag */
    getTag(tag: symbol) {
        if (!this.#tagList.has(tag)) {
            throw new Error(`no entity found with tag:${tag.description}`);
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

    /**
     * Transfers an entity to its appropriate archetype.  This is intended to be called after
     * an entity's component signature is modified, as its archetype will need to be changed.
     *
     * The algorithm will try to find an existing archetype matching the given signature,
     * and if none is found, a new archetype will be created.  The entity will then be removed
     * from the old archetype, and its component data will be copied into the new one.
    */
    private updateEntityArchetype(id: number, signature: ComponentSignature) {
        let newArchetype: Archetype | null = null;

        // Attempt to find an existing archetype matching the signature...
        for (const arch of this.#archetypes) {
            if (arch.matchesSignature(signature)) {
                newArchetype = arch;
            }
        }

        // ...Or create a new one if needed.
        if (!newArchetype) {
            newArchetype = new Archetype(new Set(signature), new Set());
            this.#archetypes.push(newArchetype);
        }

        const oldArchetype = this.#idToArchetype.get(id);

        // associate entity with new archetype
        this.#idToArchetype.set(id, newArchetype!);
        newArchetype!.addEntity(id);

        // copy existing component data from old arch -> new arch
        oldArchetype?.components.forEach((store, type) => {
            newArchetype!.components.get(type)?.set(id, store.get(id));
        });
        oldArchetype?.removeEntity(id);
    }
}
