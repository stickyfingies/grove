/* global THREE, CANNON */

module.exports = function (globals) {

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

            var shootDirection = new THREE.Vector3();
            var shootVelo = 15;

            var x = globals.BODIES['player'].body.position.x;
            var y = globals.BODIES['player'].body.position.y;
            var z = globals.BODIES['player'].body.position.z;

            var ball = globals.load.ball({
                array: 'projectiles'
            });

            getShootDir(shootDirection);
            ball.body.velocity.set(shootDirection.x * shootVelo,
                shootDirection.y * shootVelo,
                shootDirection.z * shootVelo);

            // Move the ball outside the player sphere
            x += shootDirection.x * (globals.BODIES['player'].shape.radius * 1.02 + ball.shape.radius);
            y += shootDirection.y * (globals.BODIES['player'].shape.radius * 1.02 + ball.shape.radius);
            z += shootDirection.z * (globals.BODIES['player'].shape.radius * 1.02 + ball.shape.radius);
            ball.body.position.set(x, y, z);
            ball.mesh.position.set(x, y, z);
        }
    });
};