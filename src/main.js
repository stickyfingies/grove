/* global socket */

let globals = require('./globals');
let player = require('./player');

const dt = 1 / 60;

require('./init/manager')(globals);
require('./load')(globals);
require('./shooting')(globals);
require('./multiplayer')(globals, player);

animate();

function animate(delta) {

    requestAnimationFrame(animate);

    globals.camera.updateMatrixWorld(); // make sure the camera matrix is updated
    globals.camera.matrixWorldInverse.getInverse(globals.camera.matrixWorld);
    globals.cameraViewProjectionMatrix.multiplyMatrices(globals.camera.projectionMatrix, globals.camera.matrixWorldInverse);
    globals.frustum.setFromMatrix(globals.cameraViewProjectionMatrix);

    // Update ball positions
    for (let i = 0; i < globals.BODIES['projectiles'].length; i++) {
        globals.BODIES['projectiles'][i].mesh.position.copy(globals.BODIES['projectiles'][i].body.position);
        globals.BODIES['projectiles'][i].mesh.quaternion.copy(globals.BODIES['projectiles'][i].body.quaternion);
    }

    // Update box positions
    for (let i = 0; i < globals.BODIES['items'].length; i++) {
        globals.BODIES['items'][i].mesh.position.copy(globals.BODIES['items'][i].body.position);
        globals.BODIES['items'][i].mesh.quaternion.copy(globals.BODIES['items'][i].body.quaternion);
    }

    globals.BODIES['player'].body.velocity.set(globals.BODIES['player'].body.velocity.x * 0.95, globals.BODIES['player'].body.velocity.y, globals.BODIES['player'].body.velocity.z * 0.95)
    globals.MESHES['player'].position.copy(globals.BODIES['player'].body.position);

    globals.world.step(dt);
    globals.controls.update(Date.now() - globals.delta);
    // globals.rendererDEBUG.update();
    globals.renderer.render(globals.scene, globals.camera);
    globals.delta = Date.now();

    if (player && player.serverdata && globals && globals.updatePlayerData) {
        globals.updatePlayerData();
        socket.emit('updatePosition', player.serverdata);
    }

}