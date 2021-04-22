import { GUI } from 'dat.gui';
import Engine from './engine';
import { EntityManager } from './entities';
import { Graphics } from './graphics/graphics';
import { Physics } from './physics';

export default class GameScript {
  graphics: Graphics;

  physics: Physics;

  eManager: EntityManager;

  gui: GUI;

  constructor(protected engine: Engine) {
    this.graphics = engine.graphics;
    this.physics = engine.physics;
    this.eManager = engine.eManager;
    this.gui = engine.gui;
  }
}
