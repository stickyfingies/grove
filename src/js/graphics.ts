"use strict";

import { Vector3, Quaternion, BufferGeometry, PerspectiveCamera, Object3D, Mesh, Texture, MeshBasicMaterial } from "three";

const worker = new Worker(new URL("./graphicsworker.ts", import.meta.url));

let buffer = new SharedArrayBuffer(4 * 10 * 1024);
let array = new Float32Array(buffer);

/**
 * I think this frontend should interface with the scene graph.
 * 
 * (scene graph <-> frontend) ==> backend: (worker || wasm)
 */

// this "camera" acts as a proxy for the actual rendering camera in the backend
export let camera = new PerspectiveCamera();

let entityMap = [] as any;
let entityId = 0;

export const initGraphics = () => {
    const offscreenCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const offscreen = offscreenCanvas.transferControlToOffscreen();

    entityMap[entityId] = camera;
    // @ts-ignore
    camera.entityId = entityId++;

    updateGraphics();

    worker.postMessage({
        type: "init",
        buffer,
        canvas: offscreen,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
    }, [offscreen]);
};

const writeTransformToArray = (object: Object3D) => {
    // extract position, quaternion, and scale
    object.updateMatrixWorld();
    let p = new Vector3();
    let q = new Quaternion();
    let s = new Vector3();
    object.matrixWorld.decompose(p, q, s);

    // place those values into the shared array
    // @ts-ignore
    const offset = object.entityId * 10;

    array[offset + 0] = p.x;
    array[offset + 1] = p.y;
    array[offset + 2] = p.z;

    array[offset + 3] = q.x;
    array[offset + 4] = q.y;
    array[offset + 5] = q.z;
    array[offset + 6] = q.w;

    array[offset + 7] = s.x;
    array[offset + 8] = s.y;
    array[offset + 9] = s.z;
};

export const updateGraphics = () => {
    for (let object of entityMap) {
        writeTransformToArray(object);
    }
};

export const addToScene = (object: Mesh) => {
    // register object with an ID
    entityMap[entityId] = object;
    // @ts-ignore
    object.entityId = entityId++;

    // extract raw geometry data
    // @ts-ignore
    const bufferGeometry: BufferGeometry = new BufferGeometry().fromGeometry(object.geometry);
    const arrayBuffers = [];
    for (let attributeName of Object.keys(bufferGeometry.attributes)) {
        arrayBuffers.push((bufferGeometry.attributes[attributeName].array as Float32Array).buffer)
    }

    // send object's texture data to backend
    const {map} = object.material as MeshBasicMaterial;
    if (map) uploadTexture(map);

    // send that bitch to the backend
    worker.postMessage({
        type: "addObject",
        name: object.name,
        geometry: bufferGeometry,
        imageName: map?.name
    }, arrayBuffers);
};

export const uploadTexture = (map: Texture) => {
    // draw the image to a canvas
    let canvas = document.createElement("canvas");
    canvas.width = map.image.width;
    canvas.height = map.image.height;
    let ctx = canvas.getContext("2d")!;
    ctx.drawImage(map.image, 0, 0);

    // grab raw pixel data from the canvas
    let imageData = ctx.getImageData(0, 0, map.image.width, map.image.height);

    // send pixel data to backend
    worker.postMessage({
        type: "uploadTexture",
        imageName: map.name,
        imageData: imageData.data,
        imageWidth: map.image.width,
        imageHeight: map.image.height
    });
}

export const resizeGraphicsTarget = () => { };