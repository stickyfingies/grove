import EventEmitter from 'events';

/** Anything that's a ComponentType is a class */
export interface ComponentType<T = unknown> {
    new(...args: any[]): T;
}

/** A component signature is a set of the types of components something's interested in */
export type Signature = Set<ComponentType>;

type ComponentTypeList
    = [ComponentType]
    | ComponentType[];

// https://dev.t-matix.com/blog/platform/eimplementing-a-type-saf-ecs-with-typescript/
type ComponentDataFromSignature<T> = {
    [P in keyof T]: T[P] extends ComponentType
    ? InstanceType<T[P]>
    : never
}

type ComponentList = InstanceType<ComponentType>[];

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
    signature: Signature;

    entities: Set<number>;

    components = new Map<ComponentType, ComponentList>();

    poolSize = 0;

    entityIdToIndex: number[] = [];

    indexToEntityId: number[] = [];

    constructor(signature: Signature, entities: Set<number>) {
        this.signature = signature;
        this.entities = entities;

        this.signature.forEach((type) => {
            this.components.set(type, []);
        });
    }

    addEntity(id: number) {
        this.entities.add(id);
        this.entityIdToIndex[id] = this.poolSize;
        this.indexToEntityId[this.poolSize] = id;
        this.poolSize += 1;
    }

    removeEntity(id: number) {
        const index = this.entityIdToIndex[id];
        if (id) {
            this.entities.delete(id);
            this.poolSize -= 1;
            if (index === this.poolSize) {
                delete this.entityIdToIndex[id];
                delete this.indexToEntityId[index];
            } else {
                // Copy last data entry into the deleted entity's entry (keep things contiguous)
                this.signature.forEach((type) => {
                    this.components.get(type)![index] = this.components.get(type)![this.poolSize];
                });
                this.indexToEntityId[index] = this.indexToEntityId[this.poolSize];
                this.entityIdToIndex[this.indexToEntityId[index]] = index;

                delete this.entityIdToIndex[id];
                delete this.indexToEntityId[this.poolSize];
            }
        }
    }

    setComponent<T>(id: number, type: ComponentType<T>, data: T) {
        const index = this.entityIdToIndex[id];
        this.components.get(type)![index] = data;
    }

    getComponent<T>(id: number, type: ComponentType<T>): T {
        const index = this.entityIdToIndex[id];
        return this.components.get(type)![index] as T;
    }

    hasComponent<T>(id: number, type: ComponentType<T>) {
        return this.signature.has(type) && this.entities.has(id);
    }

    executeQuery<T extends ComponentTypeList>(
        query: T,
        callback: (c: ComponentDataFromSignature<T>, id: number) => void,
    ) {
        if (this.containsSignature(new Set(query))) {
            // @ts-ignore - Type magic
            const proxy: ComponentDataFromSignature<T> = Array(query.length).fill(null);
            for (let i = 0; i < this.poolSize; i++) {
                for (let j = 0; j < query.length; j++) {
                    // @ts-ignore - Type magic
                    proxy[j] = this.components.get(query[j])![i];
                }
                callback(proxy, this.indexToEntityId[i]);
            }
        }
    }

    /** Copies entity data from an old archetype -> this archetype */
    transferEntityFrom(id: number, oldArchetype: Archetype) {
        this.addEntity(id);
        const index = this.entityIdToIndex[id];
        const oldIndex = oldArchetype.entityIdToIndex[id];
        oldArchetype.components.forEach((store, type) => {
            if (this.signature.has(type)) {
                this.components.get(type)![index] = store[oldIndex];
            }
        });
        oldArchetype.removeEntity(id);
    }

    /** Check if this archetype has EXACTLY the same component types listed in `signature` */
    matchesSignature(signature: Signature) {
        let equal = this.signature.size === signature.size;
        for (const value of this.signature) {
            if (!signature.has(value)) {
                equal = false;
                break;
            }
        }
        return equal;
    }

    /** Check if this archetype contains AT LEAST all the component types listed in `query` */
    containsSignature(query: Signature) {
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

    constructor() {
        // @ts-ignore - Useful for debugging
        window.archetypes = this.#archetypes;
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
            // archetype.components.get(type)?.delete(id);
        }

        archetype.removeEntity(id);
        this.#idToArchetype.delete(id);
    }

    /** Set a component for an entity */
    setComponent<T>(id: number, type: ComponentType<T>, data: T) {
        // move entity to a different archetype matching its new signature
        const signature = new Set(this.#idToArchetype.get(id)?.signature);
        signature.add(type);
        const archetype = this.updateEntityArchetype(id, signature);

        // set the component (BEFORE event)
        archetype.setComponent(id, type, data);

        // emit a `set` event
        this.events.emit(`set${type.name}Component`, id, data);
    }

    /** Delete a component for an entity.  Returns whether the component was deleted */
    deleteComponent(id: number, type: ComponentType) {
        const data = this.getComponent(id, type);

        // assign to new entity archetype
        const oldArchetype = this.#idToArchetype.get(id);
        const signature = new Set(oldArchetype?.signature);
        signature.delete(type);
        this.updateEntityArchetype(id, signature);

        // emit a `delete` event
        this.events.emit(`delete${type.name}Component`, id, data);
    }

    /** Get a component from an entity */
    getComponent<T>(id: number, type: ComponentType<T>): T {
        const archetype = this.#idToArchetype.get(id);

        if (!archetype) {
            throw new Error(`getComponent(id: ${id}, type: ${type.name}): ID does not exist!`)
        }

        if (!archetype?.signature.has(type)) {
            throw new Error(`getComponent(id: ${id}, type: ${type.name}): component is not registered!`);
        }

        return archetype.getComponent(id, type);
    }

    /** Check if an entity has a component */
    hasComponent(id: number, type: ComponentType): boolean {
        const archetype = this.#idToArchetype.get(id);

        return archetype?.hasComponent(id, type) || false;
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

    /**
     * Get a list of all entity id's which match a component signature
     * @example
     * ```ts
     * const frogs = this.ecs.submitQuery([PhysicsData, MeshData, HealthData]);
     * for (const [[body, mesh, health], entityId] of frogs) {
     *      // do logic...
     * }
     * ```
     */
    * submitQuery<T extends ComponentTypeList>(query: T) {
        // add entity ID's from archetypes that match signature
        const signature = new Set(query);
        for (const archetype of this.#archetypes) {
            if (archetype.containsSignature(signature)) {
                for (const entity of archetype.entities) {
                    // @ts-ignore - Type magic
                    const proxy: ComponentDataFromSignature<T> = Array(query.length).fill(null);
                    for (let i = 0; i < query.length; i++) {
                        // @ts-ignore - Type magic
                        proxy[i] = archetype.getComponent(entity, query[i])!;
                    }
                    const result: [ComponentDataFromSignature<T>, number] = [proxy, entity]
                    yield result;
                }
            }
        }
    }

    executeQuery<T extends ComponentTypeList>(
        query: T,
        callback: (c: ComponentDataFromSignature<T>, id: number) => void,
    ) {
        for (const archetype of this.#archetypes) {
            archetype.executeQuery(query, callback);
        }
    }

    getEntityComponentSignature(id: number) {
        return this.#idToArchetype.get(id)?.signature // entity's signature
            ?? new Set([]); // or an empty signature, if the entity doesn't exist
    }

    /**
     * Transfers an entity to its appropriate archetype.  This is intended to be called after
     * an entity's component signature is modified, as its archetype will need to be changed.
     *
     * The algorithm will try to find an existing archetype matching the given signature,
     * and if none is found, a new archetype will be created.  The entity will then be removed
     * from the old archetype, and its component data will be copied into the new one.
    */
    private updateEntityArchetype(id: number, signature: Signature) {
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

        // Transfer data from old archetype (if it exists), and associate entity with new archetype
        const oldArchetype = this.#idToArchetype.get(id);
        if (oldArchetype) newArchetype.transferEntityFrom(id, oldArchetype);
        else newArchetype.addEntity(id);
        this.#idToArchetype.set(id, newArchetype);

        return newArchetype;
    }
}
