"use strict";

import initWorld from "./world";
import initPlayer from "./player";
import initBodies from "./bodies";

import {BasicShadowMap} from "three";

export default (globals, player) => {

    initWorld(globals.world);
    initPlayer(globals, player);
    initBodies(globals);

    globals.renderer.shadowMap.enabled = true;
    globals.renderer.shadowMapSoft = true;
    globals.renderer.shadowMap.type = BasicShadowMap;

    globals.renderer.shadowCameraNear = 3;
    globals.renderer.shadowCameraFar = globals.camera.far;
    globals.renderer.shadowCameraFov = 50;

    globals.renderer.shadowMapBias = 0.0001;
    globals.renderer.shadowMapDarkness = 0.5;
    globals.renderer.shadowMapWidth = 1024;
    globals.renderer.shadowMapHeight = 1024;
    globals.renderer.setClearColor(globals.scene.fog.color, 1);
    globals.renderer.setSize(window.innerWidth, window.innerHeight);

    globals.camera.add(globals.listener);

    document.body.appendChild(globals.renderer.domElement);

}
