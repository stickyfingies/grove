/* global CANNON, THREE */

define(['globals', './world', './player', './bodies'], function (globals) {

    globals.renderer.shadowMapEnabled = true;
    globals.renderer.shadowMapSoft = true;
    globals.renderer.setSize(window.innerWidth, window.innerHeight);
    globals.renderer.setClearColor(globals.scene.fog.color, 1);

    document.body.appendChild(globals.renderer.domElement);
    
    return {
        loaded: true
    };
    
});