"use strict";

import "../css/play";
import "../css/skill";

import pointerlock from "./pointerlock";
pointerlock();

let globals = require("./globals");
let player = require("./player");
    
const dt = 1 / 60;

let items = require("./items");
let gui = require("./gui");
let shooting = require("./shooting");
import multiplayer from "./multiplayer";

gui.init(player)
shooting(globals, player);
multiplayer(globals, player);

THREE.DefaultLoadingManager.onProgress = (item, loaded, total) => {
    console.log(`${loaded} out of ${total}`);
    if (loaded == total) {
        $('#spinner').hide();
        $('#load-play-btn, .play-btn').show();
        _.once(animate)();
        gui.quests();
    }
};

function animate(delta) {
    if (window.controls && window.controls.enabled) {
        if (globals.remove.bodies.length && globals.remove.meshes.length) {
            for (let key in globals.remove.bodies) {
                globals.world.remove(globals.remove.bodies[key]);
                delete globals.remove.bodies[key];
            }
            for (let key in globals.remove.meshes) {
                globals.scene.remove(globals.remove.meshes[key]);
                delete globals.remove.meshes[key];
            }
        }
        else if (globals.remove.tweens.length) {
            for (let key in globals.remove.tweens) {
                globals.TWEENS[globals.remove.bodies[key]].stop();
                delete globals.remove.tweens[key];
            }
        }

        // Update bullets, etc.
        for (let i = 0; i < globals.BODIES['projectiles'].length; i++) {
            globals.BODIES['projectiles'][i].mesh.position.copy(globals.BODIES['projectiles'][i].body.position);
            globals.BODIES['projectiles'][i].mesh.quaternion.copy(globals.BODIES['projectiles'][i].body.quaternion);
        }

        // Update items
        for (let i = 0; i < globals.BODIES['items'].length; i++) {
            globals.BODIES['items'][i].mesh.position.copy(globals.BODIES['items'][i].body.position);
            if (!globals.BODIES['items'][i].norotate) globals.BODIES['items'][i].mesh.quaternion.copy(globals.BODIES['items'][i].body.quaternion);
        }

        for (let key in globals.TWEENS) {
            globals.TWEENS[key].update(delta);
        }

        globals.BODIES['player'].mesh.position.copy(globals.BODIES['player'].body.position);
        if (globals.BODIES['player'].body.position.y < -400) player.hp.val--;

        $('#health-bar').val(player.hp.val / player.hp.max * 100 > 0 ? player.hp.val / player.hp.max * 100 : 0);
        $('#health').text(`${player.hp.val > 0 ? player.hp.val : 0} HP`);
        
        if (player.hp.val <= 0) {
            globals.socket.disconnect();
            $('#blocker').fadeIn(5000);
            $('#load').show().html('<h1>You Have Perished. Game Over...</h1>');
            return;
        }

        // for (let key in globals.composers) globals.composers[key].render(delta);

        globals.world.step(dt);
        globals.controls.update(Date.now() - globals.delta);
        // globals.rendererDEBUG.update();
        globals.renderer.render(globals.scene, globals.camera);
        globals.delta = Date.now();

        if (player && player.serverdata && globals && globals.updatePlayerData) {
            globals.updatePlayerData();
            globals.socket.emit('updatePosition', player.serverdata);
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    globals.camera.aspect = window.innerWidth / window.innerHeight;
    globals.camera.updateProjectionMatrix();
    globals.renderer.setSize(window.innerWidth, window.innerHeight);
}