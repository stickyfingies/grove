define(['globals'], function (globals) {
    return function () {

        var solver = new CANNON.GSSolver();

        globals.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        globals.world.defaultContactMaterial.contactEquationRelaxation = 4;
        globals.world.defaultContactMaterial.friction = 1e9;

        solver.iterations = 7;
        solver.tolerance = 0.1;
        var split = true;
        if (split)
            globals.world.solver = new CANNON.SplitSolver(solver);
        else
            globals.world.solver = solver;

        globals.world.gravity.set(0, -20, 0);
        globals.world.broadphase = new CANNON.NaiveBroadphase();

        ////////////////////////////////////////////////////////

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

        globals.BODIES['projectiles'] = [];
        globals.BODIES['items'] = [];

        globals.controls = new PointerLockControls(globals.camera, globals.BODIES['player'].body);
        globals.scene.add(globals.controls.getObject());
        
        window.controls = globals.controls;

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

        globals.MESHES['player'] = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2.5, 1),
            new THREE.MeshLambertMaterial()
        );
        globals.MESHES['player'].castShadow = true;
        globals.scene.add(globals.MESHES['player']);

        globals.MESHES['projectiles'] = [];

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

        globals.renderer.shadowMapEnabled = true;
        globals.renderer.shadowMapSoft = true;
        globals.renderer.setSize(window.innerWidth, window.innerHeight);
        globals.renderer.setClearColor(globals.scene.fog.color, 1);

        document.body.appendChild(globals.renderer.domElement);
    };
});