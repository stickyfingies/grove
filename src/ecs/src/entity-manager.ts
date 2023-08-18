import EventEmitter from 'events';
import { Archetype, transferEntityFrom } from './archetype';
import { ComponentDataFromSignature, ComponentSignature, ComponentType, ComponentTypeList, SignatureHash } from './types';

export interface CreateEntityEvent {
    entity_id: number
}

export interface DeleteEntityEvent {
    entity_id: number
}

export interface SetComponentEvent {
    entity_id: number,
    name: string,
    data: any
}

export interface DeleteComponentEvent {
    entity_id: number,
    name: string,
    data: any
}

export interface SignatureDelta {
    added: ComponentSignature,
    removed: ComponentSignature
}

/** Used when moving entities between archetypes */
export interface SignatureChangedEvent {
    entity_id: number,
    old_signature: ComponentSignature,
    new_signature: ComponentSignature,
    added_components: ComponentSignature,
    removed_components: ComponentSignature
}

type Query<T extends ComponentTypeList> = {
    match: T;
    callback: (c: ComponentDataFromSignature<T>, id: number) => void;
}

class QueryCache {
    #queries: Query<any>[] = [];
    #hashes: SignatureHash[] = [];
}

type ArchetypeIndex = number;

/**
 * Represents which archetype an entity is part of (by index)
 */
type EntityRecord = {
    archetype_idx: ArchetypeIndex,
}

/** Takes a `signature` and produces a `hash` */
function hashSignature(signature: ComponentSignature): SignatureHash {
    return Array.from(signature)
        .map(type => type.name)
        .sort()
        .join(':');
}

/**
 * TODO add events for updating a component.
 *
 * I think this could be implemented by making `getComponent()` return a copy of the internal data,
 * and then using `setComponent` to override the internal state with the new state - very functional
 * approach.
 */
export class EntityManager {
    /**
     * Event bus for signalling when components are set / deleted
     * @eventProperty
     */
    readonly events = new EventEmitter();

    /** Map from tags to entities */
    #tagList = new Map<symbol, number>();

    /** Next available entity ID */
    #entityId = 0;

    /** List of entity archetypes */
    #archetypes: Archetype[] = [];

    /** Map between entity ID and its corresponding archetype */
    #entityToArchetype = new Map<number, EntityRecord>();

    /**
     * Map between #(signature) -> Archetype(signature) [EXACT MATCH]
     * TODO - Better naming / document this
     **/
    #hashToArchetype = new Map<SignatureHash, ArchetypeIndex>();

    /**
     * Map between #(signature) -> Archetypes.with(signature) [ANY SUBSET]
     * TODO - Better naming / document this
     **/
    #queryHashToArchetypes = new Map<SignatureHash, Archetype[]>();

    constructor() {
        // @ts-ignore - Useful for debugging
        if (typeof window !== 'undefined') { window.archetypes = this.#archetypes; }
    }

    /** Allocate an ID for a new entity */
    createEntity() {
        const entity_id = this.#entityId;
        this.#entityId += 1;
        this.events.emit('createEntity', { entity_id } as CreateEntityEvent);
        return entity_id;
    }

    /** Delete an entity and all its component data */
    deleteEntity(entity_id: number) {
        const archetype = this.getArchetype(entity_id)!;

        // this happens sometimes with RigidBody collision callbacks... idk why
        if (!archetype) {
            return console.error(`'EntityManager::deleteEntity(${entity_id})' - entity ${entity_id} not found!`);
        }
        // emit 'delete' events for every component in this entity
        for (const type of archetype.signature) {
            const [data] = this.getComponent(entity_id, [type]) as any;
            this.events.emit(`delete${type.name}Component`, { entity_id, name: type.name, data } as DeleteComponentEvent);
            if ('destroy' in data) data.destroy();
        }

        this.events.emit(`deleteEntity`, { entity_id } as DeleteEntityEvent);

        archetype.removeEntity(entity_id);
        this.#entityToArchetype.delete(entity_id);
    }

    /** True if entity is registered in the system (even if it has no data). */
    entityExists(entity_id: number) {
        return this.#entityToArchetype.has(entity_id);
    }

    /** Set a component for an entity */
    setComponent<T extends ComponentTypeList>(entity_id: number, types: T, data: ComponentDataFromSignature<T>) {
        const delta: SignatureDelta = { added: new Set(types), removed: new Set() }
        // move entity to a different archetype matching its new signature
        const old_signature = this.getEntityComponentSignature(entity_id);
        const new_signature = this.calculateNewSignature(old_signature, delta)
        const archetype = this.updateEntityArchetype(entity_id, delta);

        // set the component (BEFORE event)
        archetype.setComponent(entity_id, types, data);

        // Emit `signatureChanged` event
        const event: SignatureChangedEvent = {
            entity_id,
            old_signature,
            new_signature,
            added_components: new Set(types),
            removed_components: new Set()
        };
        this.events.emit('signatureChanged', event);

        // emit a `set` event
        for (let i = 0; (i < types.length) && (i < (data.length as number)); i++) {
            const type = types[i];
            const datum = data[i];
            const event: SetComponentEvent = {
                entity_id,
                name: type.name,
                data: datum
            } as const;
            this.events.emit(`set${type.name}Component`, event);
            this.events.emit(`setComponent`, event);
        }
    }

    /** Delete a component for an entity.  Returns whether the component was deleted */
    deleteComponent<T extends ComponentTypeList>(entity_id: number, types: T) {
        const delta: SignatureDelta = { added: new Set(), removed: new Set(types) };
        const data = this.getComponent(entity_id, types) as any;

        // calculate new signature
        const old_signature = this.getEntityComponentSignature(entity_id);
        const new_signature = this.calculateNewSignature(old_signature, delta);

        // Emit `signatureChanged` event
        const event: SignatureChangedEvent = {
            entity_id,
            old_signature,
            new_signature,
            added_components: new Set(),
            removed_components: new Set(types)
        };
        this.events.emit('signatureChanged', event);

        this.updateEntityArchetype(entity_id, delta);

        // emit a `delete` event
        types.forEach((type) => {
            const event: DeleteComponentEvent = { entity_id, name: type.name, data };
            this.events.emit(`delete${type.name}Component`, event);
            this.events.emit(`deleteComponent`, event);
        });

        if ('destroy' in data) data.destroy();
    }

    /** Get a component from an entity */
    getComponent<T extends ComponentTypeList>(entity_id: number, types: T): ComponentDataFromSignature<T> {
        const archetype = this.getArchetype(entity_id);

        // Check ID
        if (!archetype) {
            const typeNames = types.map(type => type.name).join(', ');
            throw new Error(`getComponent(id: ${entity_id}, type: ${typeNames}): ID does not exist!`)
        }

        // Check Types
        types
            .filter((type) => !archetype?.signature.has(type))
            .forEach((type) => {
                throw new Error(`getComponent(id: ${entity_id}, type: ${type.name}): component is not registered!`);
            });

        return archetype.getComponent(entity_id, types);
    }

    /**
     * Removes X components and adds Y components, in a single transaction.
     * This should eliminate archetype hopping in some instances.
     */
    swapComponent<T extends ComponentTypeList>
        (entity_id: number, removeTypes: ComponentTypeList, addTypes: T, addData: ComponentDataFromSignature<T>) {
        const delta: SignatureDelta = { added: new Set(addTypes), removed: new Set(removeTypes) };
        // compute new entity signature
        const old_signature = this.getEntityComponentSignature(entity_id);
        const new_signature = this.calculateNewSignature(old_signature, delta);

        // emit a `delete` event
        removeTypes.forEach((type) => {
            const [data] = this.getComponent(entity_id, [type]);
            const event: DeleteComponentEvent = { entity_id, name: type.name, data };
            this.events.emit(`delete${type.name}Component`, event);
            this.events.emit(`deleteComponent`, event);
            // TODO this is terrible
            if ('destroy' in (data as any)) (data as any).destroy();
        });

        const archetype = this.updateEntityArchetype(entity_id, delta);

        archetype.setComponent(entity_id, addTypes, addData);

        // emit a `set` event
        addTypes.forEach((type) => {
            const [data] = this.getComponent(entity_id, [type]);
            const event: SetComponentEvent = { entity_id, name: type.name, data };
            this.events.emit(`set${type.name}Component`, event);
            this.events.emit(`setComponent`, event);
        });

        // Emit `signatureChanged` event
        const event: SignatureChangedEvent = {
            entity_id,
            old_signature,
            new_signature,
            added_components: new Set(addTypes),
            removed_components: new Set(removeTypes)
        };
        this.events.emit('signatureChanged', event);
    }

    /** Check if an entity has a component */
    hasComponent(entity_id: number, type: ComponentType): boolean {
        const archetype = this.getArchetype(entity_id);
        return archetype?.hasComponent(entity_id, [type]) || false;
    }

    /** Add a tag to an entity.  Entities can later be retrieved using the same tag */
    addTag(entity_id: number, tag: symbol) {
        this.#tagList.set(tag, entity_id);
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
     * const frogs = world.submitQuery([PhysicsData, MeshData, HealthData]);
     * for (const [[body, mesh, health], entityId] of frogs) {
     *      // do logic...
     * }
     * ```
     */
    * submitQuery<T extends ComponentTypeList>(query: T) {
        const signature = new Set(query);
        const releventArchetypes = this.#archetypes.filter((arch) => arch.containsSignature(signature));

        for (const archetype of releventArchetypes) {
            for (const entity of archetype.entities) {
                const data = archetype.getComponent(entity, query);
                yield [data, entity] as [ComponentDataFromSignature<T>, number];
            }
        }
    }

    executeQuery<T extends ComponentTypeList>
        (query: T, callback: (c: ComponentDataFromSignature<T>, id: number) => void) {
        const hash = hashSignature(new Set(query));

        // look for cached queries

        // if (this.#queryHashToArchetypes.has(hash)) {
        //     const archetypes = this.#queryHashToArchetypes.get(hash)!;
        //     archetypes .forEach(arch => arch.executeQuery(query, callback));
        //     return; // :) optimized O(1) no search needed
        // }

        /// ...or fall back to linear search

        this.#queryHashToArchetypes.set(hash, []);
        this.#archetypes
            .filter((arch) => arch.containsSignature(new Set(query)))
            .forEach((arch) => {
                // this.#queryHashToArchetypes.get(hash)!.push(arch);
                arch.executeQuery(query, callback);
            });
    }

    getEntityComponentSignature(entity_id: number): ComponentSignature {
        return this.getArchetype(entity_id)?.signature // entity's signature
            ?? new Set([]); // or an empty signature, if the entity doesn't exist
    }

    /** Returns the `Archetype` entity belongs to. */
    private getArchetype(entity_id: number) {
        if (!this.#entityToArchetype.has(entity_id)) {
            return null;
        }
        const { archetype_idx } = this.#entityToArchetype.get(entity_id)!;
        return this.#archetypes[archetype_idx];
    }

    private calculateNewSignature(old_signature: ComponentSignature, delta: SignatureDelta) {
        const new_signature = new Set(old_signature);
        delta.added.forEach((type) => new_signature.add(type));
        delta.removed.forEach((type) => new_signature.delete(type));
        return new_signature;
    }

    /**
     * #### Moves an entity to an archetype that matches the given signature.
     * ---
     * * Locating target archetype is : O(1) time complexity
     * * Copying data between them is : O(n) time complexity (n=#components)
     * ---
     * This is intended to be called after an entity's component signature is
     * modified, as its archetype will need to be changed. The algorithm will try
     * to find an existing archetype matching the given signature,
     * and if none is found, a new archetype will be created.  The entity will then be removed
     * from the old archetype, and its component data will be copied into the new one.
    */
    private updateEntityArchetype(entity_id: number, delta: SignatureDelta) {
        const old_signature = this.getEntityComponentSignature(entity_id)
        const new_signature = this.calculateNewSignature(old_signature, delta);
        const hash = hashSignature(new_signature);

        // Create a new archetype if needed.
        if (!this.#hashToArchetype.has(hash)) {
            const archetype = new Archetype(new_signature, new Set());
            const idx = this.#archetypes.push(archetype) - 1;
            this.#hashToArchetype.set(hash, idx);
            // update query cache to include this new archetype
            // ! it's not "execute query".
            // ! it's 'query'->'execute function'
            // ! frog = $(Mesh, Data); //
            // foreach query
            // if arch.has(query)
            // #(query) -> add arch
        }

        const destArchetypeIdx = this.#hashToArchetype.get(hash)!;
        const destArchetype = this.#archetypes[destArchetypeIdx];

        // (old archetype?) --data-> (new archetype)
        const oldArchetype = this.getArchetype(entity_id);
        const new_index = (oldArchetype)
            ? transferEntityFrom(entity_id, oldArchetype, destArchetype)
            : destArchetype.addEntity(entity_id);
        this.#entityToArchetype.set(entity_id, { archetype_idx: destArchetypeIdx });

        return destArchetype;
    }
}