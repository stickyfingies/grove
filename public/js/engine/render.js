function animate() {
    requestAnimationFrame(animate);
    if (typeof controlsEnabled !== 'undefined' && window.keyboard !== undefined && window.player.shape !== undefined) {
        raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 3);
        raycaster.ray.origin.copy(player.shape.position);
        var intersections = raycaster.intersectObjects(objects);
        var isOnObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;
        var moveDistance = 75 * delta; // 200 pixels per second
        var rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 degrees) per second
        if (keyboard.pressed("W")) {
            var _raycaster = new THREE.Raycaster(player.shape.position, new THREE.Vector3(player.shape.position.x - 1, player.shape.position.y, player.shape.position.z), 0, 10);
            var matrix = new THREE.Matrix4();
            matrix.extractRotation(player.shape.matrix);
            var direction = new THREE.Vector3(0, 0, 1);
            matrix.multiplyVector3(direction);
            _raycaster.set(player.shape.position, direction);
            var _intersections = _raycaster.intersectObjects(objects);
            var NgF = _intersections.length > 0;
            if (!NgF) player.shape.translateZ(moveDistance);
        }
        if (keyboard.pressed("S")) {
            var _raycaster = new THREE.Raycaster(player.shape.position, new THREE.Vector3(player.shape.position.x - 1, player.shape.position.y, player.shape.position.z), 0, 5);
            var matrix = new THREE.Matrix4();
            matrix.extractRotation(player.shape.matrix);
            var direction = new THREE.Vector3(0, 0, -1);
            matrix.multiplyVector3(direction);
            _raycaster.set(player.shape.position, direction);
            var _intersections = _raycaster.intersectObjects(objects);
            var NgF = _intersections.length > 0;
            if (!NgF) player.shape.translateZ(-moveDistance);
        }
        if (keyboard.pressed("Q") && isOnObject)
            player.shape.translateX(moveDistance);
        if (keyboard.pressed("E") && isOnObject)
            player.shape.translateX(-moveDistance);
        if (keyboard.pressed("A")) {
            player.shape.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle * 1.5);
            if (viewType) camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
        }
        if (keyboard.pressed("D")) {
            player.shape.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle * 1.5);
            if (viewType) camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
        }
        if (keyboard.pressed("space") && isOnObject) {
            jumpY = player.shape.position.y;
            isJumping = true;
            velocity.y = 1.5;
        }
        if (keyboard.pressed("I") && player.inventory.length) {
            var light = new THREE.PointLight(0xffffff, 1, 50, 1);
            player.shape.add(light);
            light.translateY(5);
            player.inventory.splice(player.inventory.indexOf('glowbulb'), 1);
            events.publish('use', {name: 'glowbulb'});
            setTimeout(function () {
                light.visible = false;
                scene.remove(light);
            }, 10000);
        }
        if (keyboard.pressed("P")) {
            showQuestsGUI();
        }

        player.shape.translateY(velocity.y);
        prevTime = time;
        if (player.shape.position.y > jumpY + 15) isJumping = false;
        if (isOnObject && !isJumping) {
            velocity.y = 0;
            if (isOnObject) velocity.y = Math.max(0, velocity.y);
        }
        if (!isOnObject && !isJumping) velocity.y -= 0.1;
        if (player.shape.position.y < -100) {
            velocity.y = 0;
            player.shape.position.set(0, 10, 0);
        }
        if (isJumping)
            velocity.y -= 0.05;

        if (!viewType) var relativeCameraOffset = new THREE.Vector3(0, 7.5 + Math.pow(1.025, player.shape.position.y), -3.75 - Math.pow(1.025, player.shape.position.y));
        else var relativeCameraOffset = new THREE.Vector3(0, 20, 5);

        var cameraOffset = relativeCameraOffset.applyMatrix4(player.shape.matrixWorld);

        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
        if (!viewType) camera.lookAt(new THREE.Vector3(player.shape.position.x, player.shape.position.y + 10, player.shape.position.z));
        else camera.position.y += 7;
        //(>-_-)>#
        //(-_-)
        var dayDuration = 800;
        sunAngle += delta / dayDuration * Math.PI * 2;

        sunSphere.update(sunAngle);
        sunLight.update(sunAngle);
        skydom.update(sunAngle);
        skydom.object3d.position.set(camera.position.x, camera.position.y, camera.position.z);
        for (var key in ais) {
            ais[key].update();
        }
    }


    if (typeof renderer !== 'undefined') renderer.render(scene, camera);
}

animate();