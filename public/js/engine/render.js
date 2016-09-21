function render() {
    requestAnimationFrame(render);
    if (window.keyboard !== undefined && typeof window.controls !== 'undefined' && window.controls.getObject() !== undefined && window.camera instanceof THREE.Camera) {
        var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 15);
        raycaster.ray.origin.copy(controls.getObject().position);
        var intersections = raycaster.intersectObjects(objects);
        var isOnObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;
        var moveDistance = 45 * delta; // 200 pixels per second
        var rotateAngle = Math.PI / 4 * delta; // pi/2 radians (90 degrees) per second
        if (keyboard.pressed("W") && !$("input").is(":focus")) {
            var _raycaster = new THREE.Raycaster(controls.getObject().position, new THREE.Vector3(0, 0, 0), 0, 5);
            var matrix = new THREE.Matrix4();
            matrix.extractRotation(controls.getObject().matrix);
            var direction = new THREE.Vector3(0, 0, 1);
            _raycaster.set(controls.getObject().position, direction);
            var _intersections = _raycaster.intersectObjects(objects, true);
            var NgF = _intersections.length > 0;
            if (!NgF) controls.getObject().translateZ(-moveDistance);
            updatePlayerData();
            socket.emit('updatePosition', player.serverdata);
        }
        if (keyboard.pressed("S") && !$("input").is(":focus")) {
            var _raycaster = new THREE.Raycaster(controls.getObject().position, new THREE.Vector3(0, 0, 0), 0, 5);
            var matrix = new THREE.Matrix4();
            matrix.extractRotation(controls.getObject().matrix);
            var direction = new THREE.Vector3(0, 0, -1);
            _raycaster.set(controls.getObject().position, direction);
            var _intersections = _raycaster.intersectObjects(objects, true);
            var NgF = _intersections.length > 0;
            if (!NgF) controls.getObject().translateZ(moveDistance);
            updatePlayerData();
            socket.emit('updatePosition', player.serverdata);
        }
        if (keyboard.pressed("A") && !$("input").is(":focus") && isOnObject)
            controls.getObject().translateX(-moveDistance);
        if (keyboard.pressed("D") && !$("input").is(":focus") && isOnObject)
            controls.getObject().translateX(moveDistance);
        if (keyboard.pressed("space") && !$("input").is(":focus") && isOnObject) { // yippeeeeeeeeeeeeeeeeeeeeeeeeeeeee
            jumpY = controls.getObject().position.y;
            isJumping = true;
            velocity.y = 1.5;
        }
        if (keyboard.pressed('M') && !$("input").is(":focus")) audio.volume = !audio.volume; //mutes || unmutes, depending on current volume

        controls.getObject().position.y += (velocity.y);
        prevTime = time;
        if (controls.getObject().position.y > jumpY + 15) isJumping = false;
        if (isOnObject && !isJumping) {
            velocity.y = 0;
            if (isOnObject) velocity.y = Math.max(0, velocity.y);
        }
        if (!isOnObject && !isJumping) velocity.y -= 0.1;
        if (controls.getObject().position.y < -100) {
            velocity.y = 0;
            controls.getObject().position.set(0, 10, 0);
        }
        if (isJumping) {
            velocity.y -= 0.05;
            updatePlayerData();
            socket.emit('updatePosition', player.serverdata);
        }

        //(>-_-)>#
        // (-_-)
        // controls.getObject().update();
        var dayDuration = 900;
        sunAngle += delta / dayDuration * Math.PI * 2;
        sunSphere.update(sunAngle);
        sunLight.update(sunAngle);
        skydom.update(sunAngle);
        skydom.object3d.position.set(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
        starfield.update(sunAngle);
        for (var key in particles) particles[key].tick(delta);
        TWEEN.update(time);
    }


    if (typeof renderer !== 'undefined' && camera instanceof THREE.Camera) renderer.render(scene, camera);
}