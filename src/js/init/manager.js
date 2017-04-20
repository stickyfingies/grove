function init(globals, player) {

    require('./world')(globals);
    require('./player')(globals, player);
    require('./bodies')(globals, player);

    globals.renderer.shadowMapEnabled = true;
    globals.renderer.shadowMapSoft = true;
    globals.renderer.shadowMapType = THREE.BasicShadowMap;

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

module.exports = init;
