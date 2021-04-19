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

export interface Task {
  (delta: number, data: object[]): void;
  queries: ComponentSignature;
}

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

export const events = new EventEmitter();

const tagList = new Map<string, number>();

const dataManagers = new Map<DataType, DataManager>();

// maps an entity ID to its component signature
let entityId = 0;

const idToArchetype: Map<number, Archetype> = new Map();

const archetypes: Archetype[] = [];

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

export class Entity {
  #id: number;

  //

  constructor(id?: number) {
    this.#id = id ?? entityId;
    if (!id) entityId += 1;
  }

  get id() {
    return this.#id;
  }

  //

  delete() {
    idToArchetype.get(this.#id)!.signature.forEach((type) => {
      events.emit(`delete${type.name}Component`, this.#id, this.getComponent(type));
    });
    idToArchetype.delete(this.#id);
    archetypes.forEach((arch) => {
      arch.entities.delete(this.#id);
    });
    dataManagers.forEach((manager) => {
      if (manager.hasComponent(this.#id)) {
        manager.deleteComponent(this.#id);
      }
    });
    this.#id = -1;
  }

  setComponent(type: DataType, data: object) {
    // attaching a component changes the entity's component signature, invalidating whichever
    // archetype (if any) it was previously a part of

    const oldSignature = new Set(idToArchetype.get(this.#id)?.signature);
    oldSignature.add(type);

    idToArchetype.delete(this.#id);
    archetypes.forEach((arch) => {
      arch.entities.delete(this.#id);
    });

    if (!dataManagers.has(type)) {
      dataManagers.set(type, new DataManager());
    }

    dataManagers.get(type)?.setComponent(this.#id, data);

    // we should attempt to add this entity to an existing archetype
    // it's more than likely that one already exists

    let entityInArchetype = false;

    archetypes.forEach((arch) => {
      if (areSetsEqual(arch.signature, oldSignature)) {
        entityInArchetype = true;
        idToArchetype.set(this.#id, arch);
        arch.entities.add(this.#id);
      }
    });

    // if we couldn't find an archetype that matches this entity's list of components,
    // create one that contains this entity

    if (!entityInArchetype) {
      const arch = new Archetype(new Set(oldSignature), new Set([this.#id]));
      archetypes.push(arch);
      idToArchetype.set(this.#id, arch);
    }

    // emit an event indicating what happened

    events.emit(`set${type.name}Component`, this.#id, data);

    return this;
  }

  getComponent<T>(type: DataType<T>): T {
    // lazily initialize data manager
    if (!dataManagers.has(type)) {
      console.error(`component type ${type.name} is not registered`);
      dataManagers.set(type, new DataManager());
    }

    return dataManagers.get(type)?.getComponent(this.#id)!;
  }

  hasComponent(type: DataType): boolean {
    // lazily initialize data manager
    if (!dataManagers.has(type)) {
      console.warn(`component type ${type.name} is not registered`);
      dataManagers.set(type, new DataManager());
    }

    return dataManagers.get(type)?.hasComponent(this.#id)!;
  }

  addTag(tag: string) {
    tagList.set(tag, this.#id);
    return this;
  }

  static getTag(tag: string) {
    if (!tagList.has(tag)) {
      console.error(`no entity found with tag:${tag}`);
    }

    return new Entity(tagList.get(tag)!);
  }
}

//

export const executeTask = (task: Task, delta: number) => {
  archetypes.forEach((arch) => {
    // ensure this archetype has all required components
    if (!queryComponents(task.queries, arch.signature)) return;

    // pass entity data to task
    arch.entities.forEach((id) => {
      const entity = new Entity(id);
      const data: DataType[] = [];

      // push this entity's component data into a list
      task.queries.forEach((type) => {
        data.push(entity.getComponent(type));
      });

      // pass that list to the task
      task(delta, data);
    });
  });
};
