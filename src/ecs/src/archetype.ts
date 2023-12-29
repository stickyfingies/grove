import {
    ComponentDataFromSignature,
    ComponentList,
    ComponentSignature,
    ComponentType,
    ComponentTypeList
} from "./types";

/**
 * i.e. "add:Death|remove:Health"
 */
type SignatureHash = string;

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
export class Archetype {
    signature: ComponentSignature;

    entities: Set<number>;

    components = new Map<ComponentType, ComponentList>();

    poolSize = 0;

    entityIdToIndex: number[] = [];

    indexToEntityId: number[] = [];

    /**
     * Maps a string representing signature changes to a destination archetype.
     * 
     * Used to optimize the process of finding a suitable destination archetype
     * when an entity's signature changes. O(n) search -> O(1) lookup
     */
    transitions: Map<SignatureHash, Archetype> = new Map();

    constructor(signature: ComponentSignature, entities: Set<number>) {
        this.signature = signature;
        this.entities = entities;
        // instantiate component arrays
        this.signature.forEach((type) => this.components.set(type, []));
    }

    addEntity(id: number) {
        this.entities.add(id);
        const entity_idx = this.poolSize;
        this.entityIdToIndex[id] = entity_idx;
        this.indexToEntityId[entity_idx] = id;
        this.poolSize += 1;
        return entity_idx;
    }

    removeEntity(id: number) {
        const index = this.entityIdToIndex[id];
        if (id) {
            this.entities.delete(id);
            this.poolSize -= 1;
            // Swap
            if (index !== this.poolSize) {
                this.signature.forEach((type) => {
                    this.components.get(type)![index] = this.components.get(type)![this.poolSize];
                });
                this.indexToEntityId[index] = this.indexToEntityId[this.poolSize];
                this.entityIdToIndex[this.indexToEntityId[index]] = index;
            }
            // Pop
            delete this.entityIdToIndex[id];
            delete this.indexToEntityId[this.poolSize];
        }
    }

    setComponent<T extends ComponentTypeList>
    (id: number, types: T, data: ComponentDataFromSignature<T>) {
        const index = this.entityIdToIndex[id];
        for (let i = 0; (i < types.length) && (i < (data.length as number)); i++) {
            this.components.get(types[i])![index] = data[i];
        }
        return index;
    }

    getComponent<T extends ComponentTypeList>
    (entity_id: number, types: T): ComponentDataFromSignature<T> {
        const index = this.entityIdToIndex[entity_id];
        return types.map((type) => { return this.components.get(type)![index]; }) as ComponentDataFromSignature<T>;
    }

    hasComponent(id: number, types: ComponentTypeList) {
        // Check ID
        if (!this.entities.has(id)) return false;
        // Check Types
        return types
            .filter((type) => !this.signature.has(type))
            .length === 0;
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

    /** True if this has EXACTLY the same component types listed in `signature` */
    matchesSignature(signature: ComponentSignature) {
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
 * Copies entity data from an old archetype -> this archetype
 * @returns The index in newArchetype where entity's data is held
 * */
export function transferEntityFrom(entity_id: number, oldArchetype: Archetype, newArchetype: Archetype) {
    const index = newArchetype.addEntity(entity_id);
    const oldIndex = oldArchetype.entityIdToIndex[entity_id];
    oldArchetype.components.forEach((store, type) => {
        if (newArchetype.signature.has(type)) {
            newArchetype.components.get(type)![index] = store[oldIndex];
        }
    });
    oldArchetype.removeEntity(entity_id);
    return index;
}