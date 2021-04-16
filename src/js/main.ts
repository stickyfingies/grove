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
import { loadPhysicsModel, loadModel } from './load';
import { initGraphics, updateGraphics, GraphicsData } from './graphics';
import { initPhysics, PhysicsData, updatePhysics } from './physics';
import { Entity, executeTask, Task } from './entities';

import maps from './json/maps.json';
import gameScripts from './game/_scripts.json';

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

// initialize the game
const init = () => {
  // initialize engine systems
  initGraphics();
  initPhysics();

  // show asset loading progress
  DefaultLoadingManager.onProgress = (url, loaded, total) => {
    console.log(`${url} (${loaded}/${total})`);
    if (loaded === total) {
      $('#spinner').hide();
      $('#load-play-btn, .play-btn').show();
    }
  };

  // load game scripts
  gameScripts.scripts.forEach(async (scriptName: string) => {
    const script = await import(`./game/${scriptName}`);

    // initialize script
    if ('init' in script) {
      script.init(engineData);
    }

    // register `update` tasks
    if ('tasks' in script) {
      script.tasks.forEach((task: Task) => {
        gameTasks.push(task);
      });
    }
  });

  // load the map
  maps['skjar-isles'].objects.forEach((path: string) => {
    loadModel(path, (mesh: Mesh) => {
      const body = loadPhysicsModel(mesh, 0);
      new Entity()
        .setComponent(GraphicsData, mesh)
        .setComponent(PhysicsData, body);
    });
  });

  // show performance statistics
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

    // update game
    gameTasks.forEach((task) => {
      executeTask(task, delta);
    });

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
