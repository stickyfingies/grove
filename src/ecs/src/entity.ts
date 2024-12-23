import autoBind from 'auto-bind';

import { EntityManager } from './entity-manager';
import { ComponentType } from './types';

/**
 * Object-oriented wrapper around an `EntityManager` entity id
 * @see `EntityManager` for all method documentation.
 */
export class Entity {
  /** Convenience; prevents needing to specify an entity manager with each created entity */
  static defaultManager: EntityManager;

  /** The `EntityManager` this entity belongs to */
  readonly manager: EntityManager;

  /** ID of the entity being wrapped */
  readonly id: number;

  constructor(manager = Entity.defaultManager, id = manager.createEntity()) {
    autoBind(this);
    this.manager = manager;
    this.id = id;
  }

  delete() {
    this.manager.deleteEntity(this.id);
  }

  setComponent<T>(type: ComponentType<T>, data: T) {
    this.manager.put(this.id, [type], [data]);
    return this;
  }

  deleteComponent(type: ComponentType) {
    this.manager.deleteComponent(this.id, [type]);
    return this;
  }

  getComponent<T>(type: ComponentType<T>): T {
    return this.manager.get(this.id, [type])[0];
  }

  hasComponent(type: ComponentType): boolean {
    return this.manager.has(this.id, type);
  }

  addTag(tag: symbol) {
    this.manager.addTag(this.id, tag);
    return this;
  }

  static getTag(tag: symbol, manager = Entity.defaultManager) {
    const id = manager.getTag(tag);
    return new Entity(manager, id);
  }
}
