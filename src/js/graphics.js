"use strict";

import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    Mesh,
    BasicShadowMap,
    Sprite,
    Vector2,
    SpriteMaterial,
    NormalBlending,
    HemisphereLight,
    DirectionalLight,
    ImageUtils,
    Fog,
    BackSide,
    BoxGeometry,
    MeshBasicMaterial
} from "three";

/**
 * There are a few ways of offloading graphics work:
 * 
 * - send window events to worker, handle camera ops from there
 * - synchronize camera pos/quaternions between threads (preferred)
 */

let scene = new Scene();

let camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);

export const getScene = () => scene;

export const getCamera = () => camera;

export const addObjectToScene = (object) => {
    scene.add(object);
}

export const removeObjectFromScene = (object) => {
    scene.remove(object);
}