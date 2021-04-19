import {
  World, GSSolver, SplitSolver, NaiveBroadphase, Body, Vec3, Ray, RaycastResult, Sphere,
} from 'cannon-es';
import { events } from './entities';

export const PhysicsData = Body;
// eslint-disable-next-line no-redeclare
export type PhysicsData = Body;

export class Physics {
  #world = new World();

  init() {
    this.#world.allowSleep = true;
    this.#world.defaultContactMaterial.contactEquationStiffness = 1e9;
    this.#world.defaultContactMaterial.contactEquationRelaxation = 4;
    this.#world.defaultContactMaterial.friction = 2;

    const solver = new GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;

    const split = true;
    this.#world.solver = split ? new SplitSolver(solver) : solver;

    this.#world.gravity.set(0, -9.8, 0);

    this.#world.broadphase = new NaiveBroadphase();
    this.#world.broadphase.useBoundingBoxes = true;

    events.on(`set${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
      this.#world.addBody(data);
    });

    events.on(`delete${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
      this.#world.removeBody(data);
    });
  }

  update(delta: number) {
    this.#world.step(1 / 60, Math.min(delta, 1 / 30), 10);
  }

  raycast(from: Vec3, to: Vec3) {
    const ray = new Ray(from, to);
    const result = new RaycastResult();

    ray.intersectWorld(this.#world, { result, collisionFilterMask: 1 });

    return result.hasHit;
  }

  static makeBall(mass: number, radius: number) {
    const shape = new Sphere(radius);
    const body = new Body({ mass });

    body.addShape(shape);

    return body;
  }
}
