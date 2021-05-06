import EntityManager, { DataType } from './entity-manager';

/**
 * Object-oriented wrapper around an `EntityManager` entity id
 * @see `EntityManager` for all method documentation.
 */
export default class Entity {
  /** Convenience; prevents needing to specify an entity manager with each created entity */
  static defaultManager: EntityManager;

  /** The `EntityManager` this entity belongs to */
  readonly #manager: EntityManager;

  /** ID of the entity being wrapped */
  readonly #id: number;

  constructor(manager = Entity.defaultManager, id = manager.createEntity()) {
    this.#manager = manager;
    this.#id = id;
  }

  get id() { return this.#id; }

  get manager() { return this.#manager; }

  delete() {
    this.manager.deleteEntity(this.id);
  }

  setComponent<T>(type: DataType<T>, data: T) {
    this.manager.setComponent(this.id, type, data);
    return this;
  }

  deleteComponent(type: DataType) {
    this.manager.deleteComponent(this.id, type);
    return this;
  }

  getComponent<T>(type: DataType<T>): T {
    return this.manager.getComponent(this.id, type);
  }

  hasComponent(type: DataType): boolean {
    return this.manager.hasComponent(this.id, type);
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
