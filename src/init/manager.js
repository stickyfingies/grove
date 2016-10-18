function init(globals) {

    require('./world')(globals);
    require('./bodies')(globals);
    require('./player')(globals);

    globals.renderer.shadowMapEnabled = true;
    globals.renderer.shadowMapSoft = true;
    globals.renderer.setClearColor(globals.scene.fog.color, 1);
    globals.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild( globals.renderer.domElement );

}

module.exports = init;