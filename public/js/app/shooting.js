define(['globals'], function (globals) {
    return function () {
        function getShootDir(targetVec) {
            var projector = new THREE.Projector();
            var vector = targetVec;
            targetVec.set(0, 0, 1);
            projector.unprojectVector(vector, globals.camera);
            var ray = new THREE.Ray(globals.BODIES['player'].body.position, vector.sub(globals.BODIES['player'].body.position).normalize());
            targetVec.copy(ray.direction);
        }

        window.addEventListener("click", function (e) {
            if (globals.controls.enabled == true) {

                var ballShape = new CANNON.Sphere(0.2);
                var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
                var shootDirection = new THREE.Vector3();
                var shootVelo = 15;

                var x = globals.BODIES['player'].body.position.x;
                var y = globals.BODIES['player'].body.position.y;
                var z = globals.BODIES['player'].body.position.z;
                var ballBody = new CANNON.Body({
                    mass: 100
                });

                ballBody.addShape(ballShape);
                var ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({
                    color: 0xFF00FF
                }));
                globals.world.add(ballBody);
                globals.scene.add(ballMesh);
                ballMesh.castShadow = true;
                ballMesh.receiveShadow = true;
                globals.BODIES['projectiles'].push({
                    body: ballBody,
                    shape: ballShape,
                    mesh: ballMesh
                });
                getShootDir(shootDirection);
                ballBody.velocity.set(shootDirection.x * shootVelo,
                    shootDirection.y * shootVelo,
                    shootDirection.z * shootVelo);

                // Move the ball outside the player sphere
                x += shootDirection.x * (globals.BODIES['player'].shape.radius * 1.02 + ballShape.radius);
                y += shootDirection.y * (globals.BODIES['player'].shape.radius * 1.02 + ballShape.radius);
                z += shootDirection.z * (globals.BODIES['player'].shape.radius * 1.02 + ballShape.radius);
                ballBody.position.set(x, y, z);
                ballMesh.position.set(x, y, z);
            }
        });
    }
});