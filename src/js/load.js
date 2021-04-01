"use strict";

import { ObjectLoader, BoxGeometry, SphereGeometry, Mesh, MeshPhongMaterial, Texture, SpriteMaterial, Sprite, Vector3, Quaternion } from "three";
import { Vec3, Body, Sphere, Box, Trimesh } from "cannon-es";
import { addEntity, getEntity } from "./entities";
import { addToScene } from "./graphics";

///

let models = {};
let accessCount = {};
let callbacks = {};

export const loadModel = (uri, callback) => {
    accessCount[uri] = accessCount[uri] ?? 0;
    ++accessCount[uri];

    callbacks[uri] = callbacks[uri] ?? [];
    callbacks[uri].push(callback);

    // if this is the first time this resource was requested, load it
    if (accessCount[uri] === 1) {
        let loader = new ObjectLoader();
        loader.load(uri, object => {
            models[uri] = object;
            models[uri].updateMatrixWorld();

            // for each child in object
            //   upload child
            //   for each texture in child
            //      upload texture

            // model may have been requested again since it started loading,
            // serve asset to all cached requests
            models[uri].traverse((child) => {
                if (child instanceof Mesh) {
                    for (let cb of callbacks[uri]) {
                        let inst = child.clone();
                        child.updateWorldMatrix();
                        let p = new Vector3();
                        let q = new Quaternion();
                        let s = new Vector3();
                        child.matrixWorld.decompose(p, q, s);
                        inst.position.copy(p);
                        inst.quaternion.copy(q);
                        inst.scale.copy(s);
                        addToScene(inst);
                        cb(inst);
                    }
                }
            });
        });
    }

    // the model is cached
    if (models[uri]) {
        models[uri].traverse((child) => {
            let inst = child.clone();
            child.updateWorldMatrix();
            let p = new Vector3();
            let q = new Quaternion();
            let s = new Vector3();
            child.matrixWorld.decompose(p, q, s);
            inst.position.copy(p);
            inst.quaternion.copy(q);
            inst.scale.copy(s);
            addToScene(inst);
            callback(inst);
        });
    }
};

export const loadPhysicsModel = (mesh, mass, globals) => {
    let verts = [];
    let faces = [];

    for (let i = 0; i < mesh.geometry.vertices.length; i++) {
        const { x, y, z } = mesh.geometry.vertices[i];
        verts.push(x);
        verts.push(y);
        verts.push(z);
    }
    for (let i = 0; i < mesh.geometry.faces.length; i++) {
        const { a, b, c } = mesh.geometry.faces[i];
        faces.push(a);
        faces.push(b);
        faces.push(c);
    }

    let shape = new Trimesh(verts, faces);
    let body = new Body({
        mass,
        material: globals.groundMaterial
    });
    body.addShape(shape);
    body.position.copy(mesh.position);
    body.quaternion.copy(mesh.quaternion);
    globals.world.addBody(body);

    const index = addEntity(body, shape, mesh);
    return getEntity(index);
}

export const ball = (opts = {}, globals) => {
    let shape = new Sphere(opts.radius ?? 0.2);
    let body = new Body({
        mass: opts.mass ?? 10
    });
    body.addShape(shape);
    globals.world.addBody(body);

    let geometry = new SphereGeometry(shape.radius, 32, 32);
    let ballMesh = opts.mesh || new Mesh(geometry, opts.mat || new MeshPhongMaterial({
        color: opts.c ?? 0x00CCFF
    }));
    addToScene(ballMesh);

    const index = addEntity(body, shape, ballMesh, opts?.norotate);
    let entity = getEntity(index);

    opts.cb?.(entity);

    return entity;
}

export const box = (opts = {}, globals) => {
    let halfExtents = new Vec3(opts.l ?? 1, opts.h ?? 1, opts.w ?? 1);
    let boxShape = new Box(halfExtents);
    let boxGeometry = new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let boxBody = new Body({
        mass: opts.mass ?? 0
    });
    boxBody.addShape(boxShape);
    let boxMesh = opts.mesh ?? new Mesh(boxGeometry, opts.mat || new MeshPhongMaterial({
        color: 0xFF0000
    }));
    const index = addEntity(boxBody, boxShape, boxMesh)

    let body = getEntity(index);

    globals.world.addBody(body.body);
    body.mesh.castShadow = true;
    body.mesh.receiveShadow = true;
    opts.pos ? body.mesh.position.set(opts.pos.x, opts.pos.y, opts.pos.z) : null;
    body.norotate = opts.norotate ?? false;

    return body;
}
