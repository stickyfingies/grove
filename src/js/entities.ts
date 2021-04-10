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

export interface DataManager {
  setComponent: (entity: number, data: object) => void;
  getComponent: (entity: number) => any;
  hasComponent: (entity: number) => boolean;
  deleteComponent: (entity: number) => void;
}

export interface Task {
  (data: object[], delta: number): void;
  queries: Function[];
}

//

const tagList = new Map<string, number>();

const dataManagers = new Map<any, DataManager>();

const idList: number[] = [];

//

export const registerDataManager = (type: Function, manager: DataManager) => {
  dataManagers.set(type, manager);
};

//

class DefaultDataManager implements DataManager {
  components = new Map<number, any>();

  setComponent(entity: number, data: any) {
    this.components.set(entity, data);
  }

  getComponent(entity: number) {
    return this.components.get(entity)!;
  }

  hasComponent(entity: number) {
    return this.components.has(entity);
  }

  deleteComponent(entity: number) {
    return this.components.delete(entity);
  }
}

export class Entity {
  #id: number;

  //

  constructor(id?: number) {
    this.#id = id ?? idList.push(idList.length) - 1;
  }

  get id() {
    return this.#id;
  }

  //

  delete() {
    dataManagers.forEach((manager) => {
      if (manager.hasComponent(this.#id)) {
        manager.deleteComponent(this.#id);
      }
    });
    this.#id = -1;
  }

  setComponent(type: Function, data: object) {
    if (!dataManagers.has(type)) {
      console.warn(`component type ${type.name} is not registered`);
      dataManagers.set(type, new DefaultDataManager());
    }

    dataManagers.get(type)?.setComponent(this.#id, data);

    return this;
  }

  getComponent(type: Function): any {
    if (!dataManagers.has(type)) {
      console.warn(`component type ${type.name} is not registered`);
      dataManagers.set(type, new DefaultDataManager());
    }

    return dataManagers.get(type)?.getComponent(this.#id)!;
  }

  hasComponent(type: Function): boolean {
    if (!dataManagers.has(type)) {
      console.warn(`component type ${type.name} is not registered`);
      dataManagers.set(type, new DefaultDataManager());
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
  idList.forEach((id) => {
    const entity = new Entity(id);
    const data: any[] = [];
    let matches = true;
    task.queries.forEach((type) => {
      if (!(matches && entity.hasComponent(type))) {
        matches = false;
        return;
      }
      data.push(entity.getComponent(type));
    });

    if (matches) {
      task(data, delta);
    }
  });
};
