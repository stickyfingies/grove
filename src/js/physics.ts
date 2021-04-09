import {
  World, GSSolver, SplitSolver, NaiveBroadphase, Body,
} from 'cannon-es';
import { DataManager, registerDataManager } from './entities';

export const PhysicsData = Body;
// eslint-disable-next-line no-redeclare
export type PhysicsData = Body;

const world = new World();

class PhysicsManager implements DataManager {
  components = new Map<number, Body>();

  setComponent(entity: number, data: any) {
    this.components.set(entity, data);
    world.addBody(data);
  }

  getComponent(entity: number) {
    return this.components.get(entity)!;
  }

  hasComponent(entity: number) {
    return this.components.has(entity);
  }

  deleteComponent(entity: number) {
    world.removeBody(this.components.get(entity)!);
    return this.components.delete(entity);
  }
}

export const initPhysics = () => {
  registerDataManager(PhysicsData, new PhysicsManager());

  world.allowSleep = true;
  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;
  world.defaultContactMaterial.friction = 2;

  const solver = new GSSolver();
  solver.iterations = 7;
  solver.tolerance = 0.1;

  const split = true;
  world.solver = split ? new SplitSolver(solver) : solver;

  world.gravity.set(0, -9.8, 0);
  world.broadphase = new NaiveBroadphase();
};

export const updatePhysics = (delta: number) => {
  world.step(1 / 60, Math.min(delta, 1 / 30));
};
