"use strict";

import { PerspectiveCamera, Vector3, Quaternion } from "three";

let camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);

const worker = new Worker(new URL("./graphics-worker.js", import.meta.url));

export const initGraphics = () => {
    const offscreenCanvas = document.getElementById("main-canvas");
    const offscreen = offscreenCanvas.transferControlToOffscreen();

    worker.postMessage({
        type: "init",
        canvas: offscreen,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
    }, [offscreen]);
};

export const updateGraphics = () => {
    let p = new Vector3();
    let q = new Quaternion();
    let s = new Vector3();
    camera.updateMatrix();
    camera.updateWorldMatrix();
    camera.matrixWorld.decompose(p, q, s);
    worker.postMessage({ type: "updateCamera", matrix: camera.matrixWorld, p, q, s });
};

export const addGraphicsObject = ({ name, arrayBuffers, geometry, imageData, imageWidth, imageHeight, p, q, s }) => {
    worker.postMessage({
        type: "addObject",
        name,
        geometry,
        imageData,
        imageWidth,
        imageHeight,
        p,
        q,
        s
    }, arrayBuffers);
};

export const getCamera = () => camera;