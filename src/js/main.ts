import 'bootstrap/dist/css/bootstrap';
import '../css/play';

import { DefaultLoadingManager, Mesh } from 'three';
import $ from 'jquery';
// @ts-ignore
import Stats from 'stats-js';
import globals from './globals';
import Player from './player';
import pointerlock from './pointerlock';
import shooting from './shooting';
import { loadPhysicsModel, loadModel } from './load';
import {
  initGraphics, updateGraphics, resizeGraphicsTarget, camera,
} from './graphics';
import { world, initPhysics } from './physics';
import { getEntity, entityList } from './entities';
import PointerLockControls from './threex/pointerlockControls';

let gameStarted = false;

// initiate the game

// guiInit(globals, player);
initGraphics();
initPhysics();
const player = new Player();
const playerEnt = getEntity(0);
const controls = new PointerLockControls(camera, document.body, playerEnt.body);
shooting(globals, controls);
loadModel('/models/skjar-isles/skjar-isles.json', (child: Mesh) => loadPhysicsModel(child, 0));
// AI(globals);
pointerlock();

// asset loading handler

console.groupCollapsed('[LoadingManager]');
DefaultLoadingManager.onProgress = (url, loaded, total) => {
  console.log(`${url} (${loaded}/${total})`);
  if (loaded === total) {
    console.groupEnd();
    $('#spinner').hide();
    $('#load-play-btn, .play-btn').show();
    gameStarted = true;
    // quests();
  }
};

// main game loop

let then = 0;

const stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);

const animate = (now: number) => {
  const delta = now - then;

  stats.begin();

  if (gameStarted && controls.isLocked) {
    // remove entities that need to be removed
    globals.remove.bodies.forEach((body) => {
      world.removeBody(body);
    });
    globals.remove.bodies = [];

    globals.remove.meshes.forEach(() => {
      // todo: remove mesh
    });
    globals.remove.meshes = [];

    // update physics
    world.step(1 / 60, Math.min(delta, 1 / 30));

    // copy physical body transforms to their corresponding mesh
    entityList.forEach((e: any) => {
      e.mesh.position.copy(e.body.position);
      if (!e.norotate) e.mesh.quaternion.copy(e.body.quaternion);
    });

    // update controls & graphics
    controls.update(delta);
    updateGraphics();

    // death
    if (player.hp.val <= 0) {
      $('#blocker').fadeIn(5000);
      $('#load').show().html('<h1>You Have Perished. Game Over...</h1>');
      return;
    }
  }

  stats.end();

  requestAnimationFrame(animate);
  then = now;
};

requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  resizeGraphicsTarget({
    width: window.innerWidth,
    height: window.innerHeight,
  });
});
