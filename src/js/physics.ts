import {
  World, GSSolver, SplitSolver, NaiveBroadphase, Body, Vec3, Ray, RaycastResult,
} from 'cannon-es';
import { events } from './entities';

export const PhysicsData = Body;
// eslint-disable-next-line no-redeclare
export type PhysicsData = Body;

const world = new World();

export const raycast = (from: Vec3, to: Vec3) => {
  const ray = new Ray(from, to);
  const result = new RaycastResult();
  ray.intersectWorld(world, { result, collisionFilterMask: 1 });
  return result.hasHit;
};

export const initPhysics = () => {
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
  world.broadphase.useBoundingBoxes = true;

  events.on(`set${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
    world.addBody(data);
  });

  events.on(`delete${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
    world.removeBody(data);
  });
};

export const updatePhysics = (delta: number) => {
  world.step(1 / 60, Math.min(delta, 1 / 30), 10);
};
