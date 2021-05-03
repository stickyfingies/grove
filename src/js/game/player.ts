import { Body, Sphere } from 'cannon-es';
import $ from 'jquery';
import {
  CanvasTexture, Sprite, SpriteMaterial, Vector3,
} from 'three';
import { Entity } from '../entities';
import { CameraData, CAMERA_TAG, MeshData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { PhysicsData } from '../physics';
import GameScript from '../script';
import { HealthData } from './health';
import { KeyboardControlData } from './keyboardControls';
import ScoreData from './score';

export const PLAYER_TAG = Symbol('player');

export default class PlayerScript extends GameScript {
  init() {
    const player = new Entity()
      .addTag(PLAYER_TAG);

    player.setComponent(HealthData, {
      hp: {
        value: 100,
        max: 100,
      },
    });

    player.setComponent(ScoreData, {
      score: 0,
    });

    // create physics body
    const mass = 100;
    const radius = 1.7;
    const shape = new Sphere(radius);
    const playerBody = new Body({
      collisionFilterGroup: 2,
      allowSleep: false,
      fixedRotation: true,
      mass,
    });
    playerBody.addShape(shape);
    playerBody.position.y = 15;
    player.setComponent(PhysicsData, playerBody);

    // initialize KB control options
    player.setComponent(KeyboardControlData, {
      velocityFactor: 4,
      jumpVelocity: 1.5,
      hitNormal: new Vector3(),
      angle: 0,
    });

    /**
     * HUD
     * note: hud currently only updates when player takes damage (score may be off)
     */

    const hud = new Entity();

    const hudSprite = new Sprite();
    hudSprite.material = new SpriteMaterial();
    hudSprite.position.set(0, -0.5, -1.3);
    hudSprite.scale.set(0.2, 0.2, 0.2);
    hudSprite.parent = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    hud.setComponent(MeshData, hudSprite);

    const drawHUD = () => {
      const { canvas, ctx } = GraphicsUtils.scratchCanvasContext(256, 256);
      const score = player.getComponent(ScoreData);
      const health = player.getComponent(HealthData);
      ctx.font = '54px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText(`${health.hp.value}/${health.hp.max}HP`, canvas.width / 2, 54);
      ctx.fillText(`${score.score} points`, canvas.width / 2, 108);

      hudSprite.material.map = new CanvasTexture(canvas);
      this.graphics.updateMaterial(hudSprite);
    };

    drawHUD();

    /**
     * Damage Handling
     */

    // handle fall damage
    playerBody.addEventListener('collide', ({ contact }: any) => {
      const health = player.getComponent(HealthData);
      const impact = contact.getImpactVelocityAlongNormal();

      if (Math.abs(impact) >= 15) {
        health.hp.value -= Math.floor(Math.abs(impact) / 10);
        drawHUD();
      }
    });

    // handle death
    this.eManager.events.on(`delete${HealthData.name}Component`, (id) => {
      const score = player.getComponent(ScoreData);
      if (id === player.id) {
        $('#blocker').show();
        $('#load').hide().fadeIn(5000).html(`<h1>You Have Perished. Score... ${score.score}</h1>`);
      }
    });

    // attach data to debug GUI
    this.gui.add(playerBody.position, 'x').listen();
    this.gui.add(playerBody.position, 'y').listen();
    this.gui.add(playerBody.position, 'z').listen();
  }
}
