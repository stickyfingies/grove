/* eslint-disable max-classes-per-file */
/**
 *
 * Goals: integrate graphics with the entity system
 *
 * There needs to be a way to say, "hey - when this component gets removed, do X"
 *
 * ```
 * == demo test ==
 *
 * const e = createEntity();
 *
 * graphics.addComponent(e);
 * graphics.getComponent(e);
 * graphics.deleteComponent(e);
 *
 * == in graphics ==
 *
 * registerComponentManager('graphics', GraphicsData, graphicsComponentManager);
 *
 * == in game ==
 *
 * import {GraphicsData, addGraphicsComponent} from 'graphics'
 * import {addComponent} from 'entities'
 * const c: GraphicsData = addComponent(e, 'graphics'); // dependencies: (graphics, entities)
 * const c: GraphicsData = addGrahpicsComponent(e);     // dependencies: (graphics)
 *
 * == in some system ==
 *
 * Hey, here's a system that needs all grpahics + physics components
 * Who would have knowledge about which entities have both components?
 * A middle man could keep track (this file)
 *
 * // runtime checking (we can do this for starters!)
 *
 * for every single entity
 *  if entity has all components
 *    callback
 *
 * == thoughts ==
 *
 * addToScene, addToWorld can be automated when graphics/physics data is added
 * ^^^ and same with when data is removed (decoupling!!!)
 *
 * As a coder using my own API, i'd feel more comfortable calling them Data than Components
 * a Component carries a certain expectation for usage, data is just.... data. and they're just data
 * ```
 */

import EventEmitter from 'events';

interface DataType<T = any> {
  new(): T;
}

type ComponentSignature = Set<DataType>;

class DataManager {
  components = new Map<number, object>();

  setComponent(entity: number, data: object): void {
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

class Archetype {
  // eslint-disable-next-line
  constructor(public signature: ComponentSignature, public entities: Set<number>) {}
}

//

const areSetsEqual = <T>(setA: Set<T>, setB: Set<T>) => {
  let equal = setA.size === setB.size;
  setA.forEach((value) => {
    if (!setB.has(value)) equal = false;
  });
  return equal;
};

// checks if `signature` contains AT LEAST all the components specified in `queries`
const queryComponents = (queries: ComponentSignature, signature: ComponentSignature) => {
  let matches = true;
  queries.forEach((type) => {
    if (!(matches && signature.has(type))) {
      // oh no, the entity is missing a component
      matches = false;
    }
  });

  return matches;
};

//

interface IEntityManager {
  createEntity(): number;

  deleteEntity(id: number): void;

  setComponent(id: number, type: DataType, data: object): void;

  deleteComponent(id: number, type: DataType): void;

  getComponent<T>(id: number, type: DataType<T>): T;

  hasComponent(id: number, type: DataType): boolean;

  addTag(id: number, tag: string): void;

  getTag(tag: string): number;
}

export class Entity {
  #manager: IEntityManager;

  #id: number;

  // eslint-disable-next-line
  constructor(manager: IEntityManager, id: number = manager.createEntity()) {
    this.#manager = manager;
    this.#id = id;
  }

  get id() {
    return this.#id;
  }

  get manager() {
    return this.#manager;
  }

  delete() {
    this.manager.deleteEntity(this.id);
  }

  setComponent(type: DataType, data: object) {
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

  addTag(tag: string) {
    this.manager.addTag(this.id, tag);
    return this;
  }

  static getTag(manager: IEntityManager, tag: string) {
    const id = manager.getTag(tag);
    return new Entity(manager, id);
  }
}

export interface Task {
  execute(delta: number, entity: Entity): void;
  queries: ComponentSignature;
}

export class EntityManager implements IEntityManager {
  #events = new EventEmitter();

  #tagList = new Map<string, number>();

  #dataManagers = new Map<DataType, DataManager>();

  // maps an entity ID to its component signature
  #entityId = 0;

  #idToArchetype: Map<number, Archetype> = new Map();

  #archetypes: Archetype[] = [];

  get events() {
    return this.#events;
  }

  createEntity() {
    const id = this.#entityId;
    this.#entityId += 1;
    return id;
  }

  deleteEntity(id: number) {
    const archetype = this.#idToArchetype.get(id)!;

    archetype.signature.forEach((type) => {
      this.events.emit(`delete${type.name}Component`, id, this.getComponent(id, type));
      this.#dataManagers.get(type)?.deleteComponent(id);
    });

    archetype.entities.delete(id);

    this.#idToArchetype.delete(id);
  }

  setComponent(id: number, type: DataType, data: object) {
    // assign to new entity archetype
    const signature = new Set(this.#idToArchetype.get(id)?.signature);
    signature.add(type);
    this.refreshArchetype(id, signature);

    // lazily initialize data manager
    if (!this.#dataManagers.has(type)) {
      this.#dataManagers.set(type, new DataManager());
    }

    this.#dataManagers.get(type)?.setComponent(id, data);

    // emit a `set` event
    this.events.emit(`set${type.name}Component`, id, data);
  }

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

    this.#dataManagers.get(type)?.deleteComponent(id);
  }

  getComponent<T>(id: number, type: DataType<T>): T {
    // lazily initialize data manager
    if (!this.#dataManagers.has(type)) {
      console.error(`component type ${type.name} is not registered`);
      this.#dataManagers.set(type, new DataManager());
    }

    return this.#dataManagers.get(type)?.getComponent(id)!;
  }

  hasComponent(id: number, type: DataType): boolean {
    // lazily initialize data manager
    if (!this.#dataManagers.has(type)) {
      console.warn(`component type ${type.name} is not registered`);
      this.#dataManagers.set(type, new DataManager());
    }

    return this.#dataManagers.get(type)?.hasComponent(id)!;
  }

  addTag(id: number, tag: string) {
    this.#tagList.set(tag, id);
  }

  getTag(tag: string) {
    if (!this.#tagList.has(tag)) {
      console.error(`no entity found with tag:${tag}`);
    }

    return this.#tagList.get(tag)!;
  }

  executeTask(task: Task, delta: number) {
    this.#archetypes.forEach((arch) => {
      // ensure this archetype has all required components
      if (!queryComponents(task.queries, arch.signature)) return;

      // pass entity data to task
      arch.entities.forEach((id) => {
        const data: DataType[] = [];

        // push this entity's component data into a list
        task.queries.forEach((type) => {
          data.push(this.getComponent(id, type));
        });

        // pass that list to the task
        task.execute(delta, new Entity(this, id));
      });
    });
  }

  private refreshArchetype(id: number, signature: ComponentSignature) {
    // component signature changed; remove affiliations with any old archetypes
    this.#idToArchetype.delete(id);
    this.#archetypes.forEach((arch) => {
      arch.entities.delete(id);
    });

    let entityInArchetype = false;

    // we should attempt to add this entity to an existing archetype
    // it's more than likely that one already exists
    this.#archetypes.forEach((arch) => {
      if (areSetsEqual(arch.signature, signature)) {
        entityInArchetype = true;
        this.#idToArchetype.set(id, arch);
        arch.entities.add(id);
      }
    });

    // if we couldn't find an archetype that matches this entity's list of components,
    // create one that contains this entity
    if (!entityInArchetype) {
      const arch = new Archetype(new Set(signature), new Set([id]));
      this.#archetypes.push(arch);
      this.#idToArchetype.set(id, arch);
    }
  }
}
