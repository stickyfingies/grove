function init() {

    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;
    world.defaultContactMaterial.friction = 1e9;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a sphere
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
    world.add(sphereBody);
    BODIES['player'] = {
        body: sphereBody,
        shape: sphereShape
    };

    BODIES['projectiles'] = [];
    BODIES['items'] = [];

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({
        mass: 0
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(groundBody);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x110011, 0.02);

    var ambient = new THREE.AmbientLight(0x111111);
    scene.add(ambient);

    light = new THREE.SpotLight(0xffffff);
    light.position.set(10, 30, 20);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;

    light.shadowCameraNear = camera.near;
    light.shadowCameraFar = camera.far;
    light.shadowCameraFov = camera.fov;

    light.shadowMapBias = -1;
    light.shadowMapDarkness = 0.5;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    light.shadowCameraVisible = true;
    scene.add(light);

    MESHES['player'] = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2.5, 1),
        new THREE.MeshLambertMaterial()
    );
    MESHES['player'].castShadow = true;
    scene.add(MESHES['player']);

    MESHES['projectiles'] = [];

    controls = new PointerLockControls(camera, BODIES['player'].body);
    scene.add(controls.getObject());

    // floor
    geometry = new THREE.PlaneGeometry(300, 300, 50, 50);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: 0x00FF00,
        shininess: 10,
    }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 1);

    rendererDEBUG = new THREE.CannonDebugRenderer(scene, world);

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    var geometry = new THREE.TorusGeometry(40, 2, 8, 8);
    var material = new THREE.MeshLambertMaterial({
        color: 0xffff00
    });
    var torus = new THREE.Mesh(geometry, material);
    torus.position.set(0, 100, 10);
    scene.add(torus);
    load(torus, {
        mass: 100
    });
    window.torus = torus;
}