/**
 * === GOALS ===
 * A revamp of the model / scene loding system is coming up soon
 */

import 'bootstrap/dist/css/bootstrap';
import '../css/play';

import { DefaultLoadingManager, Mesh } from 'three';
import $ from 'jquery';
// @ts-ignore
import Stats from 'stats-js';
import { GUI } from 'dat.gui';
import pointerlock from './pointerlock';
import { loadPhysicsModel, loadModel } from './load';
import { initGraphics, updateGraphics, GraphicsData } from './graphics';
import { initPhysics, PhysicsData, updatePhysics } from './physics';
import { Entity, executeTask, Task } from './entities';

// eslint-disable-next-line import/extensions
import maps from './json/maps.json';
import transformTask from './transformTask';

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import gameModules from './game/*.*';
import { initKeyboardControls, keyboardControlTask } from './keyboardControls';

// this gets passed to game modules when they initialize.
// eventually, I'd like this to be an entire class, but it depends on how engine organization
// pans out.
const engineData = {
  running: false,
  gui: new GUI(),
};

let then = 0;

let stats: Stats;

const gameTasks: Task[] = [];

// initiate the game

const init = () => {
  initGraphics();
  initPhysics();

  gameModules.forEach((module: any) => {
    module.init(engineData);

    if (module.tasks) {
      module.tasks.forEach((task: Task) => {
        gameTasks.push(task);
      });
    }
  });

  initKeyboardControls(engineData);

  DefaultLoadingManager.onStart = (url) => {
    console.log(url);
    console.groupCollapsed(url);
  };

  DefaultLoadingManager.onProgress = (url, loaded, total) => {
    console.log(`${url} (${loaded}/${total})`);
    if (loaded === total) {
      $('#spinner').hide();
      $('#load-play-btn, .play-btn').show();
    }
  };

  DefaultLoadingManager.onLoad = () => {
    console.groupEnd();
  };

  maps['skjar-isles'].objects.forEach((path: string) => {
    loadModel(path, (mesh: Mesh) => {
      const body = loadPhysicsModel(mesh, 0);
      new Entity()
        .setComponent(GraphicsData, mesh)
        .setComponent(PhysicsData, body);
    });
  });

  pointerlock(engineData);

  stats = new Stats();

  stats.showPanel(1);

  document.body.appendChild(stats.dom);
};

// main game loop

const animate = (now: number) => {
  const delta = now - then;

  stats.begin();

  if (engineData.running) {
    // update physics

    updatePhysics(delta);

    gameTasks.forEach((task) => {
      executeTask(task, delta);
    });

    executeTask(keyboardControlTask, delta);

    // copy physical body transforms to their corresponding mesh

    executeTask(transformTask, delta);

    // update graphics

    updateGraphics();
  }

  stats.end();

  then = now;

  requestAnimationFrame(animate);
};

// my quasi main method

init();

requestAnimationFrame(animate);
