import 'bootstrap/dist/css/bootstrap';
import '../css/play';

import {
  DefaultLoadingManager, Mesh, Quaternion, Vector3,
} from 'three';
import $ from 'jquery';
// @ts-ignore
import Stats from 'stats-js';
import { GUI } from 'dat.gui';
import { initPlayer, playerSystem } from './player';
import pointerlock from './pointerlock';
import shooting from './shooting';
import { loadPhysicsModel, loadModel } from './load';
import {
  initGraphics, updateGraphics, resizeGraphicsTarget, camera, GraphicsData,
} from './graphics';
import { initPhysics, PhysicsData, updatePhysics } from './physics';
import { Entity, System, runSystem } from './entities';
import PointerLockControls from './threex/pointerlockControls';

// eslint-disable-next-line import/extensions
import maps from './json/maps.json';
import AI from './AI';

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
// impor gameModules from './game/*.*';

// gameModules.forEach((module: any) => {
//   const inst = new module.Plugin();
//   inst.run();
// });

class TransformSystem implements System {
  queries = [GraphicsData, PhysicsData];

  // eslint-disable-next-line class-methods-use-this
  update([mesh, body]: [GraphicsData, PhysicsData]) {
    const pos = new Vector3(body.position.x, body.position.y, body.position.z);
    // eslint-disable-next-line max-len
    const quat = new Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    mesh.position.copy(pos);
    if (!mesh.userData.norotate) mesh.quaternion.copy(quat);
  }
}

let gameStarted = false;
let controls: PointerLockControls;
let then = 0;
let stats: Stats;
let transform: TransformSystem;

// initiate the game

const init = () => {
  initGraphics();
  initPhysics();
  initPlayer();
  const playerid = Entity.getTag('player');
  controls = new PointerLockControls(camera, document.body, playerid.getComponent(PhysicsData));
  shooting(controls);
  AI();

  maps['skjar-isles'].objects.forEach((path: string) => {
    loadModel(path, (mesh: Mesh) => {
      const body = loadPhysicsModel(mesh, 0);
      new Entity()
        .setComponent(GraphicsData, mesh)
        .setComponent(PhysicsData, body);
    });
  });

  pointerlock();

  console.groupCollapsed('[LoadingManager]');
  DefaultLoadingManager.onProgress = (url, loaded, total) => {
    console.log(`${url} (${loaded}/${total})`);
    if (loaded === total) {
      console.groupEnd();
      $('#spinner').hide();
      $('#load-play-btn, .play-btn').show();
      gameStarted = true;
    }
  };

  stats = new Stats();
  stats.showPanel(1);
  document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(playerid.getComponent(PhysicsData).position, 'x').listen();
  gui.add(playerid.getComponent(PhysicsData).position, 'y').listen();
  gui.add(playerid.getComponent(PhysicsData).position, 'z').listen();

  transform = new TransformSystem();

  window.addEventListener('resize', () => {
    resizeGraphicsTarget({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });
};

// main game loop

const animate = (now: number) => {
  const delta = now - then;

  stats.begin();

  if (gameStarted && controls.isLocked) {
    // update physics
    updatePhysics(delta);

    // copy physical body transforms to their corresponding mesh
    runSystem(transform);

    // update controls & graphics
    controls.update(delta);
    updateGraphics();

    // death
    runSystem(playerSystem);
  }

  stats.end();

  then = now;
  requestAnimationFrame(animate);
};

// my quasi main method

init();
requestAnimationFrame(animate);
