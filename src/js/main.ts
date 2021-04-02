"use strict";

import "../css/play";
import "../css/skill";

import globals from "./globals";
import player from "./player";
import pointerlock from "./pointerlock";
import shooting from "./shooting";
import manager from "./init/manager";
import { loadPhysicsModel, loadModel } from "./load";
import { initGraphics, updateGraphics, resizeGraphicsTarget, camera } from "./graphics";
// import AI from "./AI";
// import {init as guiInit, quests} from "./gui";
import { DefaultLoadingManager, Mesh } from "three";
import { getEntity, entityList } from "./entities";
import { PointerLockControls } from "./threex/pointer-lock-controls";
import $ from "jquery";

let gameStarted = false;

// initiate the game

// guiInit(globals, player);
initGraphics();
manager(globals, player);
const playerEnt = getEntity(0);
let controls = new PointerLockControls(camera, document.body, playerEnt.body);
shooting(globals, controls);
loadModel("/models/skjar-isles/skjar-isles.json", (child: Mesh) => loadPhysicsModel(child, 0, globals));
// AI(globals);
pointerlock();

// asset loading handler

console.groupCollapsed("[LoadingManager]");
DefaultLoadingManager.onProgress = (item, loaded, total) => {
    console.log(`${item} (${loaded}/${total})`);
    if (loaded == total) {
        console.groupEnd();
        $('#spinner').hide();
        $('#load-play-btn, .play-btn').show();
        gameStarted = true;
        // quests();
    }
};

// main game loop

let then = 0;

const animate = (now: number) => {
    const delta = now - then;

    if (gameStarted && controls.isLocked) {
        // remove entities that need to be removed
        for (let key in globals.remove.bodies) {
            globals.world.removeBody(globals.remove.bodies[key]);
            delete globals.remove.bodies[key];
        }
        for (let key in globals.remove.meshes) {
            // todo: remove mesh from scene
            delete globals.remove.meshes[key];
        }

        // update physics
        globals.world.step(1 / 60, Math.min(delta, 1 / 30));

        // copy physical body transforms to their corresponding mesh
        for (let e of entityList) {
            e.mesh.position.copy(e.body.position);
            if (!e.norotate) e.mesh.quaternion.copy(e.body.quaternion);
        }

        // update controls & graphics
        controls.update(delta);
        updateGraphics();

        // death
        if (player.hp.val <= 0) {
            $("#blocker").fadeIn(5000);
            $("#load").show().html("<h1>You Have Perished. Game Over...</h1>");
            return;
        }
    }

    requestAnimationFrame(animate);
    then = now;
}

requestAnimationFrame(animate);

window.addEventListener("resize", resizeGraphicsTarget);