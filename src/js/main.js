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
import { load, loadModel } from "./load";
import { initGraphics, getCamera, updateGraphics, addGraphicsObject } from "./graphics";
// import AI from "./AI";
// import {init as guiInit, quests} from "./gui";

import { DefaultLoadingManager, Quaternion, Vector3, Mesh, BufferGeometry } from "three";
import _ from "lodash";
import { entityList } from "./entities";

const dt = 1 / 60;

// guiInit(globals, player);
initGraphics();
shooting(globals, player);
manager(globals, player);
loadModel(`/models/skjar-isles/skjar-isles.json`, object => {
    object.updateMatrixWorld(false, true);
    object.traverse(child => {
        if (child instanceof Mesh) {

            const map = child.material.map;

            let canvas = document.createElement("canvas");
            canvas.width = map.image.width;
            canvas.height = map.image.height;

            let ctx = canvas.getContext("2d");
            ctx.drawImage(map.image, 0, 0);

            let imageData = ctx.getImageData(0, 0, map.image.width, map.image.height);

            load(child, {
                mass: 0,
                material: globals.groundMaterial
            }, globals);

            const bufferGeometry = new BufferGeometry().fromGeometry(child.geometry);
            const arrayBuffers = [];
            for (let attributeName of Object.keys(bufferGeometry.attributes)) {
                arrayBuffers.push(bufferGeometry.attributes[attributeName].array.buffer)
            }

            child.updateMatrixWorld();
            let p = new Vector3();
            let q = new Quaternion();
            let s = new Vector3();
            child.matrixWorld.decompose(p, q, s);

            addGraphicsObject({
                name: child.name,
                arrayBuffers,
                geometry: bufferGeometry,
                imageData: imageData.data,
                imageWidth: map.image.width,
                imageHeight: map.image.height,
                p,
                q,
                s
            });
        }
    });
});
// AI(globals);
pointerlock(globals);

DefaultLoadingManager.onProgress = (item, loaded, total) => {
    console.log(`loading ${item} (${loaded}/${total})`);
    if (loaded == total) {
        $('#spinner').hide();
        $('#load-play-btn, .play-btn').show();
        _.once(animate)();
        // quests();
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
                // todo: remove mesh from scene
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

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    getCamera().aspect = window.innerWidth / window.innerHeight;
    getCamera().updateProjectionMatrix();
}