import {
  World, GSSolver, SplitSolver, NaiveBroadphase,
} from 'cannon-es';

export const world = new World();

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
};
