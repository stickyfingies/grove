/**
 * All of the functions in this file CREATE ENTITIES, with the exception of loadmodel which triggers
 * an arbitrary callback.
 */

import {
  SphereGeometry,
  Mesh,
  MeshPhongMaterial,
  Vector3,
  Quaternion as TQuaternion,
  Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  Vec3,
  Quaternion as CQuaternion,
  Body,
  Sphere,
  Trimesh,
  Material,
} from 'cannon-es';
import { Entity } from './entities';
import { GraphicsData } from './graphics';
import { PhysicsData } from './physics';

///

const models: Record<string, Object3D> = {};
const accessCount: Record<string, number> = {};
const callbacks: Record<string, Function[]> = {};

export const loadModel = (uri: string, callback: Function) => {
  accessCount[uri] = accessCount[uri] ?? 0;
  accessCount[uri] += 1;

  callbacks[uri] = callbacks[uri] ?? [];
  callbacks[uri].push(callback);

  // if this is the first time this resource was requested, load it
  if (accessCount[uri] === 1) {
    const loader = new GLTFLoader();
    loader.load(uri, ({ scene: object }) => {
      models[uri] = object;
      models[uri].updateMatrixWorld();

      // for each child in object
      //   upload child
      //   for each texture in child
      //      upload texture

      // model may have been requested again since it started loading,
      // serve asset to all cached requests
      models[uri].traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          callbacks[uri].forEach((cb: Function) => {
            child.updateMatrixWorld();
            const p = new Vector3();
            const q = new TQuaternion();
            const s = new Vector3();
            child.matrixWorld.decompose(p, q, s);
            const inst = child.clone();
            inst.position.copy(p);
            inst.quaternion.copy(q);
            inst.scale.copy(s);
            cb(inst);
          });
        }
      });
    });
  }

  // the model is cached
  if (models[uri]) {
    models[uri].traverse((child: Object3D) => {
      child.updateMatrixWorld();
      const p = new Vector3();
      const q = new TQuaternion();
      const s = new Vector3();
      child.matrixWorld.decompose(p, q, s);
      const inst = child.clone();
      inst.position.copy(p);
      inst.quaternion.copy(q);
      inst.scale.copy(s);
      callback(inst);
    });
  }
};

export const loadPhysicsModel = ({ geometry, position, quaternion }: Mesh, mass: number) => {
  const verts = [];
  const faces = [];

  for (let i = 0; i < geometry.getAttribute('position').array.length; i++) {
    verts.push(geometry.getAttribute('position').array[i]);
  }

  for (let i = 0; i < geometry.index!.array.length; i++) {
    faces.push(geometry.index!.array[i]);
  }

  const shape = new Trimesh(verts, faces);
  const material = new Material('trimeshMaterial');
  const body = new Body({
    mass,
    material,
  });
  body.addShape(shape);

  const { x: px, y: py, z: pz } = position;
  const {
    x: qx, y: qy, z: qz, w: qw,
  } = quaternion;
  body.position.copy(new Vec3(px, py, pz));
  body.quaternion.copy(new CQuaternion(qx, qy, qz, qw));

  return body;
};

export const ball = (opts = {} as any) => {
  const shape = new Sphere(opts.radius ?? 0.2);
  const body = new Body({
    mass: opts.mass ?? 10,
  });
  body.addShape(shape);

  const geometry = new SphereGeometry(shape.radius, 32, 32);
  const mesh = opts.mesh || new Mesh(geometry, opts.mat || new MeshPhongMaterial({
    color: opts.color ?? 0x00CCFF,
  }));
  mesh.userData.norotate = opts.norotate;

  const entity = new Entity()
    .setComponent(PhysicsData, body)
    .setComponent(GraphicsData, mesh);
  return entity;
};
