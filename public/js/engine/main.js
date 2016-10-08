var world, physicsMaterial, walls = [];
var camera, scene, renderer, rendererDEBUG;
var geometry, material, mesh;
var controls, time = Date.now(),
    debug = false;

var BODIES = [],
    MESHES = [],
    LABELS = [],
    otherPlayers = [],
    otherPlayersId = [];

init();

// var loader = new THREE.ObjectLoader();
// loader.load('/img/goldenleaf/goldenleaf.json', function (mesh) {
//     scene.add(mesh);
//     mesh.scale.multiplyScalar(5);
//     mesh.traverse(function (child) {
//         if (child.geometry) {
//             load(child, {
//                 x: child.position.x,
//                 y: child.position.y,
//                 z: child.position.z,
//                 mass: 0
//             });
//         }
//     });
//     window.map = mesh;
// });

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

var frustum = new THREE.Frustum();
var cameraViewProjectionMatrix = new THREE.Matrix4();

var dt = 1 / 60;

function animate() {
    requestAnimationFrame(animate);
    world.step(dt);

    camera.updateMatrixWorld(); // make sure the camera matrix is updated
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(cameraViewProjectionMatrix);

    for (var key in LABELS) LABELS[key]();

    // Update ball positions
    for (var i = 0; i < BODIES['projectiles'].length; i++) {
        BODIES['projectiles'][i].mesh.position.copy(BODIES['projectiles'][i].body.position);
        BODIES['projectiles'][i].mesh.quaternion.copy(BODIES['projectiles'][i].body.quaternion);
    }

    // Update box positions
    for (var i = 0; i < BODIES['items'].length; i++) {
        BODIES['items'][i].mesh.position.copy(BODIES['items'][i].body.position);
        BODIES['items'][i].mesh.quaternion.copy(BODIES['items'][i].body.quaternion);
    }

    BODIES['player'].body.velocity.set(BODIES['player'].body.velocity.x * 0.95, BODIES['player'].body.velocity.y, BODIES['player'].body.velocity.z * 0.95)
    MESHES['player'].position.copy(BODIES['player'].body.position);

    controls.update(Date.now() - time);
    renderer.render(scene, camera);
    if (debug) rendererDEBUG.update();
    time = Date.now();

    // multiplayer stuff

    if (player && player.serverdata) {
        updatePlayerData();
        socket.emit('updatePosition', player.serverdata);
    }

}

function getShootDir(targetVec) {
    var projector = new THREE.Projector();
    var vector = targetVec;
    targetVec.set(0, 0, 1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(BODIES['player'].body.position, vector.sub(BODIES['player'].body.position).normalize());
    targetVec.copy(ray.direction);
}

window.addEventListener("click", function (e) {
    if (controls.enabled == true) {

        var ballShape = new CANNON.Sphere(0.2);
        var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
        var shootDirection = new THREE.Vector3();
        var shootVelo = 15;

        var x = BODIES['player'].body.position.x;
        var y = BODIES['player'].body.position.y;
        var z = BODIES['player'].body.position.z;
        var ballBody = new CANNON.Body({
            mass: 100
        });

        ballBody.addShape(ballShape);
        var ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({
            color: 0xFF00FF
        }));
        world.add(ballBody);
        scene.add(ballMesh);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;
        BODIES['projectiles'].push({
            body: ballBody,
            shape: ballShape,
            mesh: ballMesh
        });
        getShootDir(shootDirection);
        ballBody.velocity.set(shootDirection.x * shootVelo,
            shootDirection.y * shootVelo,
            shootDirection.z * shootVelo);

        // Move the ball outside the player sphere
        x += shootDirection.x * (BODIES['player'].shape.radius * 1.02 + ballShape.radius);
        y += shootDirection.y * (BODIES['player'].shape.radius * 1.02 + ballShape.radius);
        z += shootDirection.z * (BODIES['player'].shape.radius * 1.02 + ballShape.radius);
        ballBody.position.set(x, y, z);
        ballMesh.position.set(x, y, z);
    }
});

document.onkeyup = function (e) {
    if (e.keyCode == 192) debug = !debug;
}