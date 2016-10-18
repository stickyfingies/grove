/* global THREE, CANNON */

define(['globals'], function (globals) {

    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({
        mass: 0
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    globals.world.add(groundBody);

    globals.scene.fog = new THREE.FogExp2(0x110011, 0.02);

    var ambient = new THREE.AmbientLight(0x111111);
    globals.scene.add(ambient);

    var light = new THREE.SpotLight(0xffffff);
    light.position.set(10, 30, 20);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;

    light.shadowCameraNear = globals.camera.near;
    light.shadowCameraFar = globals.camera.far;
    light.shadowCameraFov = globals.camera.fov;

    light.shadowMapBias = -1;
    light.shadowMapDarkness = 0.5;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    light.shadowCameraVisible = true;
    globals.scene.add(light);

    // floor
    var geometry = new THREE.PlaneGeometry(300, 300, 50, 50);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: 0x00FF00,
        shininess: 10,
    }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    globals.scene.add(mesh);
    
    return {
        loaded: true
    };
    
});