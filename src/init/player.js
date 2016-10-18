/* global THREE, CANNON, PointerLockControls */

module.exports = function (globals) {
    
    var mass = 5,
        radius = 1.3;
    var sphereShape = new CANNON.Sphere(radius);
    var sphereBody = new CANNON.Body({
        mass: mass
    });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0, 5, 0);
    // sphereBody.linearDamping = 0.9;
    sphereBody.angularDamping = 0.9;
    globals.world.add(sphereBody);
    globals.BODIES['player'] = {
        body: sphereBody,
        shape: sphereShape
    };

    globals.MESHES['player'] = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2.5, 1),
        new THREE.MeshLambertMaterial()
    );
    globals.MESHES['player'].castShadow = true;
    globals.scene.add(globals.MESHES['player']);

    globals.controls = new PointerLockControls(globals.camera, globals.BODIES['player'].body);
    globals.scene.add(globals.controls.getObject());
    
    window.controls = globals.controls;
    
};