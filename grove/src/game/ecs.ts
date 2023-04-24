import { ComponentDataFromSignature, ComponentTypeList } from '@grove/ecs/lib/types';
import { world } from '@grove/engine';

/** creates a new entity and returns its ID.   */
export function createEntity(): number {
    return world.createEntity();
}

/** deletes the entity with the given ID and all of its components. */
export function deleteEntity(entity_id: number) {
    world.deleteEntity(entity_id);
}

/** checks if an entity with the given ID exists. */
export function entityExists(entity_id: number) {
    return world.entityExists(entity_id);
}  

/** sets the component data for an entity.
  * types is an array of the literal class types of each data element,
  * and data is an array of component data objects.
  * Component types must be unique.
  */
export function setComponent<T extends ComponentTypeList>(entity_id: number, types: T, data: ComponentDataFromSignature<T>) {
    world.setComponent(entity_id, types, data);
}

/** deletes the specified components from an entity. */
export function deleteComponent<T extends ComponentTypeList>(entity_id: number, types: T) {
    world.deleteComponent(entity_id, types);
}

/** gets the component data for an entity.Prefer object destructuring to access specific data. */
export function getComponent<T extends ComponentTypeList>(entity_id: number, types: T) {
    return world.getComponent(entity_id, types);
}