import EventEmitter from 'events';
import { Archetype, transferEntityFrom } from './archetype';
import { ComponentDataFromSignature, ComponentSignature, ComponentType, ComponentTypeList } from './types';

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

/** Used when moving entities between archetypes */
export interface SignatureChangedEvent {
    entity_id: number,
    old_signature: ComponentSignature,
    new_signature: ComponentSignature
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
    #entityToArchetype = new Map<number, Archetype>();

    constructor() {
        // @ts-ignore - Useful for debugging
        window.archetypes = this.#archetypes;
    }

    /** Allocate an ID for a new entity */
    createEntity() {
        const entity_id = this.#entityId;
        this.#entityId += 1;
        this.events.emit('createEntity', { entity_id } as CreateEntityEvent);
        return entity_id;
    }

    /**
     * This kind of makes assumptions about the nature of `components`.
     * Each component must be a function which takes an entity ID, and
     * returns an optional instance of the component data.
     * 
     * The component data **must be a class**, such that `instance.constructor`
     * reveals the type of the class.  This is the "component type" that
     * can be used to later look up the data.
     */
    spawn(components: Function[]) {
        // the component information we'll use
        const entity_id = this.createEntity();
        const data = components.map(c => c(entity_id)).filter(d => d);
        const types = data.map(d => d.constructor);
        // now, extrapolate further
        const signature = new Set([...types, ...this.getEntityComponentSignature(entity_id)]);
        const archetype = this.updateEntityArchetype(entity_id, signature);
        // install the data
        archetype.setComponent(entity_id, types, data);
        for (let i = 0; i < types.length; i++) {
            this.events.emit(`set${types[i].name}Component`, { entity_id, name: types[i].name, data: data[i] } as SetComponentEvent);
            this.events.emit(`setComponent`, { entity_id, name: types[i].name, data: data[i] } as SetComponentEvent);
        }
        //
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
            const data = this.getComponent(entity_id, [type]) as any;
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
        // move entity to a different archetype matching its new signature
        const signature = new Set(this.getEntityComponentSignature(entity_id));
        types.forEach((type) => signature.add(type));
        const archetype = this.updateEntityArchetype(entity_id, signature);

        // set the component (BEFORE event)
        archetype.setComponent(entity_id, types, data);

        // emit a `set` event
        for (let i = 0; (i < types.length) && (i < data.length); i++) {
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
        const data = this.getComponent(entity_id, types) as any;

        // assign to new entity archetype
        const oldArchetype = this.getArchetype(entity_id);
        const signature: ComponentSignature = new Set(oldArchetype?.signature);
        types.forEach((type) => signature.delete(type));
        this.updateEntityArchetype(entity_id, signature);

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
        this.#archetypes.forEach((arch) => arch.executeQuery(query, callback));
    }

    getEntityComponentSignature(entity_id: number): ComponentSignature {
        return this.getArchetype(entity_id)?.signature // entity's signature
            ?? new Set([]); // or an empty signature, if the entity doesn't exist
    }

    /** Returns the `Archetype` entity belongs to. */
    private getArchetype(entity_id: number) {
        return this.#entityToArchetype.get(entity_id);
    }

    /**
     * Transfers an entity to its appropriate archetype.  This is intended to be called after
     * an entity's component signature is modified, as its archetype will need to be changed.
     *
     * The algorithm will try to find an existing archetype matching the given signature,
     * and if none is found, a new archetype will be created.  The entity will then be removed
     * from the old archetype, and its component data will be copied into the new one.
    */
    private updateEntityArchetype(entity_id: number, signature: ComponentSignature) {
        // Find a suitable destination archetype.
        let destArchetype = this.#archetypes.find((arch) => arch.matchesSignature(signature));

        // ...Or create a new one if needed.
        if (!destArchetype) {
            destArchetype = new Archetype(new Set(signature), new Set());
            this.#archetypes.push(destArchetype);
        }

        // (old archetype?) --data-> (new archetype)
        const oldArchetype = this.getArchetype(entity_id);
        if (oldArchetype) { transferEntityFrom(entity_id, oldArchetype, destArchetype); }
        else { destArchetype.addEntity(entity_id); }
        this.#entityToArchetype.set(entity_id, destArchetype);

        // Emit `signatureChanged` event
        const event: SignatureChangedEvent = {
            entity_id,
            old_signature: oldArchetype?.signature ?? new Set(),
            new_signature: destArchetype.signature
        };
        this.events.emit('signatureChanged', event);

        return destArchetype;
    }
}