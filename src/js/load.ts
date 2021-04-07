import {
  // ObjectLoader,
  BoxGeometry,
  SphereGeometry,
  BufferGeometry,
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
  Box,
  Trimesh,
  Material,
} from 'cannon-es';
import { addEntity, getEntity } from './entities';
import { addToScene } from './graphics';
import { world } from './physics';

///

const models: Record<string, any> = {};
const accessCount: Record<string, number> = {};
const callbacks: Record<string, Function[]> = {};

export const loadModel = (uri: string, callback: any) => {
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
            const inst = child.clone();
            child.updateMatrixWorld();
            const p = new Vector3();
            const q = new TQuaternion();
            const s = new Vector3();
            child.matrixWorld.decompose(p, q, s);
            inst.position.copy(p);
            inst.quaternion.copy(q);
            inst.scale.copy(s);
            addToScene(inst as Mesh);
            cb(inst);
          });
        }
      });
    });
  }

  // the model is cached
  if (models[uri]) {
    models[uri].traverse((child: Object3D) => {
      const inst = child.clone();
      child.updateMatrixWorld();
      const p = new Vector3();
      const q = new TQuaternion();
      const s = new Vector3();
      child.matrixWorld.decompose(p, q, s);
      inst.position.copy(p);
      inst.quaternion.copy(q);
      inst.scale.copy(s);
      addToScene(inst as Mesh);
      callback(inst);
    });
  }
};

export const loadPhysicsModel = (mesh: Mesh, mass: number) => {
  const verts = [];
  const faces = [];

  const geometry = mesh.geometry as BufferGeometry;

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

  const { x: px, y: py, z: pz } = mesh.position;
  const {
    x: qx, y: qy, z: qz, w: qw,
  } = mesh.quaternion;
  body.position.copy(new Vec3(px, py, pz));
  body.quaternion.copy(new CQuaternion(qx, qy, qz, qw));

  world.addBody(body);

  const index = addEntity(body, shape, mesh);
  return getEntity(index);
};

export const ball = (opts = {} as any) => {
  const shape = new Sphere(opts.radius ?? 0.2);
  const body = new Body({
    mass: opts.mass ?? 10,
  });
  body.addShape(shape);
  world.addBody(body);

  const geometry = new SphereGeometry(shape.radius, 32, 32);
  const ballMesh = opts.mesh || new Mesh(geometry, opts.mat || new MeshPhongMaterial({
    color: opts.c ?? 0x00CCFF,
  }));
  addToScene(ballMesh);

  const index = addEntity(body, shape, ballMesh, opts?.norotate);
  const entity = getEntity(index);

  opts.cb?.(entity);

  return entity;
};

export const box = (opts = {} as any) => {
  const halfExtents = new Vec3(opts.l ?? 1, opts.h ?? 1, opts.w ?? 1);
  const boxShape = new Box(halfExtents);
  const boxGeometry = new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
  const boxBody = new Body({
    mass: opts.mass ?? 0,
  });
  boxBody.addShape(boxShape);
  const boxMesh = opts.mesh ?? new Mesh(boxGeometry, opts.mat || new MeshPhongMaterial({
    color: 0xFF0000,
  }));
  const index = addEntity(boxBody, boxShape, boxMesh);

  const body = getEntity(index);

  world.addBody(body.body);
  body.mesh.castShadow = true;
  body.mesh.receiveShadow = true;
  if (opts.pos) body.mesh.position.set(opts.pos.x, opts.pos.y, opts.pos.z);
  body.norotate = opts.norotate ?? false;

  return body;
};
