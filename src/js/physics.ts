/* eslint-disable max-classes-per-file */
import {
  World,
  GSSolver,
  SplitSolver,
  Body,
  Vec3,
  Ray,
  RaycastResult,
  Sphere,
  Cylinder,
  PointToPointConstraint,
  SAPBroadphase,
} from 'cannon-es';
import Engine from './engine';
import Entity from './ecs/entity';

export const PhysicsData = Body;
// eslint-disable-next-line no-redeclare
export type PhysicsData = Body;

export const ConstraintData = PointToPointConstraint;
// eslint-disable-next-line no-redeclare
export type ConstraintData = PointToPointConstraint;

export class Physics {
  // world container which holds all physical bodies
  #world = new World();

  #bodyToEntity = new Map<Body, Entity>();

  init(engine: Engine) {
    // general world options
    this.#world.gravity.set(0, -9.8, 0);
    this.#world.allowSleep = true;

    // default contact options (disabled friction for character controllers)
    this.#world.defaultContactMaterial.contactEquationStiffness = 1e9;
    this.#world.defaultContactMaterial.contactEquationRelaxation = 4;
    this.#world.defaultContactMaterial.friction = 0.0;

    // provide broadphase
    this.#world.broadphase = new SAPBroadphase(this.#world);
    this.#world.broadphase.useBoundingBoxes = true;

    // collision solver
    const split = true;
    const solver = new GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;
    this.#world.solver = split ? new SplitSolver(solver) : solver;

    // listen for entity events
    engine.ecs.events.on(`set${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
      this.#world.addBody(data);
      this.#bodyToEntity.set(data, new Entity(Entity.defaultManager, id));
    });
    engine.ecs.events.on(`set${ConstraintData.name}Component`, (id: number, data: ConstraintData) => {
      this.#world.addConstraint(data);
    });
    engine.ecs.events.on(`delete${PhysicsData.name}Component`, (id: number, data: PhysicsData) => {
      this.#world.removeBody(data);
      this.#bodyToEntity.delete(data);
    });
    engine.ecs.events.on(`delete${ConstraintData.name}Component`, (id: number, data: ConstraintData) => {
      this.#world.removeConstraint(data);
    });
  }

  update(delta: number) {
    this.#world.step(1 / 60, Math.min(delta, 1 / 30), 10);
  }

  getEntityFromBody(body: Body) {
    return this.#bodyToEntity.get(body);
  }

  // returns true if a body exists on the provided line
  // only detects bodies in collisionFilterGroup 1
  raycast(from: Vec3, to: Vec3) {
    const ray = new Ray(from, to);
    const result = new RaycastResult();

    ray.intersectWorld(this.#world, { result, collisionFilterMask: 1 });

    return result.hasHit;
  }

  /**
   * Utility methods for making RigidBodies
   */

  static makeBall(mass: number, radius: number) {
    const shape = new Sphere(radius);
    const body = new Body({ mass });
    body.addShape(shape);

    return body;
  }

  static makeCylinder(mass: number, radius: number, height: number) {
    const shape = new Cylinder(radius, radius, height);
    const body = new Body({ mass });
    body.addShape(shape);

    return body;
  }

  static makeCapsule(mass: number, radius: number, height: number) {
    const shape = new Sphere(radius);
    const body = new Body({ mass });
    body.addShape(shape, new Vec3(0, 0, 0));
    body.addShape(shape, new Vec3(0, height / 2, 0));
    body.addShape(shape, new Vec3(0, -height / 2, 0));

    return body;
  }
}
