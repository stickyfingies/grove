"use strict";

import "../css/play";
import "../css/skill";

/**
 * Tasks
 * - thread renderer
 *  - bodies.js
 *  - player.js
 *  - load.js
 *  - main.js
 *  - threex/PointerLockControls.js
 * - typescript (?)
 * - organize, organize, organize
 */

import globals from "./globals";
import player from "./player";
import pointerlock from "./pointerlock";
import shooting from "./shooting";
import manager from "./init/manager";
import { loadPhysicsModel, loadModel } from "./load";
import { initGraphics, updateGraphics, resizeGraphicsTarget } from "./graphics";
import AI from "./AI";
// import {init as guiInit, quests} from "./gui";

import { DefaultLoadingManager } from "three";
import _ from "lodash";
import { entityList } from "./entities";

const dt = 1 / 60;

// guiInit(globals, player);
initGraphics();
shooting(globals);
manager(globals, player);
loadModel(`/models/skjar-isles/skjar-isles.json`, child => loadPhysicsModel(child, 0, globals));
// AI(globals);
pointerlock(globals);

console.groupCollapsed("[LoadingManager]");
DefaultLoadingManager.onProgress = (item, loaded, total) => {
    console.log(`${item} (${loaded}/${total})`);
    if (loaded == total) {
        console.groupEnd();
        $('#spinner').hide();
        $('#load-play-btn, .play-btn').show();
        _.once(animate)();
        // quests();
    }
};

const animate = (delta) => {
    if (globals.controls && globals.controls.enabled) {
        for (let key in globals.remove.bodies) {
            globals.world.removeBody(globals.remove.bodies[key]);
            delete globals.remove.bodies[key];
        }
        for (let key in globals.remove.meshes) {
            // todo: remove mesh from scene
            delete globals.remove.meshes[key];
        }
        for (let key in globals.remove.tweens) {
            globals.TWEENS[globals.remove.bodies[key]].stop();
            delete globals.remove.tweens[key];
        }

        globals.world.step(dt);

        for (let e of entityList) {
            e.mesh.position.copy(e.body.position);
            if (!e.norotate) e.mesh.quaternion.copy(e.body.quaternion);
        }

        for (let key in globals.TWEENS) {
            globals.TWEENS[key].update(delta);
        }

        $('#health-bar').val(player.hp.val / player.hp.max * 100 > 0 ? player.hp.val / player.hp.max * 100 : 0);
        $('#health').text(`${player.hp.val > 0 ? player.hp.val : 0} HP`);

        if (player.hp.val <= 0) {
            globals.socket.disconnect();
            $('#blocker').fadeIn(5000);
            $('#load').show().html('<h1>You Have Perished. Game Over...</h1>');
            return;
        }

        globals.controls.update(Date.now() - globals.delta);

        updateGraphics();

        globals.delta = Date.now();
    }

    requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeGraphicsTarget);