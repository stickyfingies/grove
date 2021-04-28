import { Body, Sphere } from 'cannon-es';
import $ from 'jquery';
import {
  CanvasTexture, PointLight, Sprite, SpriteMaterial, Vector3,
} from 'three';
import { Entity } from '../entities';
import { CameraData, MeshData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { PhysicsData } from '../physics';
import GameScript from '../script';
import { HealthData } from './health';
import { KeyboardControlData } from './keyboardControls';

export default class PlayerScript extends GameScript {
  init() {
    const player = new Entity(this.eManager)
      .addTag('player');

    const health: HealthData = {
      hp: {
        value: 100,
        max: 100,
      },
    };
    player.setComponent(HealthData, health);

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
    player.setComponent(PhysicsData, playerBody);

    // initialize KB control options
    const kbControl: KeyboardControlData = {
      velocityFactor: 4,
      jumpVelocity: 1.5,
      hitNormal: new Vector3(),
      angle: 0,
    };
    player.setComponent(KeyboardControlData, kbControl);

    const light = new PointLight(0xff0000, 20, 10);
    player.setComponent(MeshData, light);

    /**
     * HUD
     */

    const hud = new Entity(this.eManager);

    const drawHUD = () => {
      const { canvas, ctx } = GraphicsUtils.scratchCanvasContext(256, 256);
      ctx.font = '54px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText(`${health.hp.value}/${health.hp.max}HP`, canvas.width / 2, canvas.height / 2);
      return new CanvasTexture(canvas);
    };

    const hudSprite = new Sprite();
    hudSprite.material = new SpriteMaterial({ map: drawHUD(), color: 0x55ff55 });
    hudSprite.position.set(0, -0.5, -1.3);
    hudSprite.scale.set(0.2, 0.2, 0.2);
    hudSprite.parent = Entity.getTag(this.eManager, 'camera').getComponent(CameraData);
    hud.setComponent(MeshData, hudSprite);

    const refreshHud = () => {
      hudSprite.material.map = drawHUD();
      this.graphics.updateMaterial(hudSprite);
    };

    /**
     * Damage Handling
     */

    // handle fall damage
    playerBody.addEventListener('collide', ({ contact }: any) => {
      const impact = contact.getImpactVelocityAlongNormal();
      if (Math.abs(impact) >= 15) {
        health.hp.value -= Math.floor(Math.abs(impact) / 10);
        refreshHud();
      }
    });

    // handle death
    this.eManager.events.on(`delete${HealthData.name}Component`, (id) => {
      if (id === Entity.getTag(this.eManager, 'player').id) {
        $('#blocker').show();
        $('#load').hide().fadeIn(5000).html('<h1>You Have Perished. Game Over...</h1>');
      }
    });

    // attach data to debug GUI
    this.gui.add(playerBody.position, 'x').listen();
    this.gui.add(playerBody.position, 'y').listen();
    this.gui.add(playerBody.position, 'z').listen();
  }
}
