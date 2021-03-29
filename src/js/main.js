"use strict";

import "../css/play";
import "../css/skill";

const debug = true;

import globals from "./globals";
import player from "./player";
import pointerlock from "./pointerlock";
import shooting from "./shooting";
import manager from "./init/manager";
import AI from "./AI";
import {init as guiInit, quests} from "./gui";

import {DefaultLoadingManager} from "three";
import _ from "lodash";
import cannonDebugger from "cannon-es-debugger";

let physicsDebugger = debug ? cannonDebugger(globals.scene, globals.world.bodies, {}) : null;

const dt = 1 / 60;

guiInit(globals, player);
shooting(globals, player);
manager(globals, player);
AI(globals);
pointerlock(globals);

DefaultLoadingManager.onProgress = (item, loaded, total) => {
    console.log(`loading ${item} (${loaded}/${total})`);
    if (loaded > 10 && loaded == total) {
        $('#spinner').hide();
        $('#load-play-btn, .play-btn').show();
        _.once(animate)();
        quests();
    }
};

function animate(delta) {
    if (globals.controls && globals.controls.enabled) {
        if (globals.remove.bodies.length && globals.remove.meshes.length) {
            for (let key in globals.remove.bodies) {
                globals.world.removeBody(globals.remove.bodies[key]);
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

        globals.world.step(dt);
        if (debug) physicsDebugger.update();

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

        globals.controls.update(Date.now() - globals.delta);
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