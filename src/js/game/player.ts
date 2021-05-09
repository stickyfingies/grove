import { Body, Sphere } from 'cannon-es';
import {
  CanvasTexture, Sprite, SpriteMaterial,
} from 'three';
import Entity from '../ecs/entity';
import { CameraData, CAMERA_TAG, GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { PhysicsData } from '../physics';
import GameScript from '../script';
import { HealthData } from './health';
import { KeyboardControlData } from './keyboardControls';
import { MovementData } from './movement';
import ScoreData from './score';

/**
 * Entity tag used to retrieve the player
 * @example Entity.getTag(PLAYER_TAG);
 */
export const PLAYER_TAG = Symbol('player');

export default class PlayerScript extends GameScript {
  init() {
    const player = new Entity()
      .addTag(PLAYER_TAG);

    player.setComponent(HealthData, {
      hp: 100,
      max: 100,
    });

    player.setComponent(ScoreData, {
      score: 0,
    });

    // create physics body
    const mass = 100;
    const radius = 1.7;
    const shape = new Sphere(radius);
    const playerBody = new Body({
      collisionFilterGroup: 2, // separate collision filter for raycasts
      allowSleep: false,
      fixedRotation: true,
      mass,
    });
    playerBody.addShape(shape);
    playerBody.position.y = 15;
    player.setComponent(PhysicsData, playerBody);

    player.setComponent(MovementData, new MovementData(6, 1.5));

    player.setComponent(KeyboardControlData, {});

    /**
     * HUD
     * @note hud currently only updates when player takes damage (score may be off)
     */

    const hud = new Entity();

    const hudSprite = new Sprite();
    hudSprite.material = new SpriteMaterial();
    hudSprite.position.set(0, -0.5, -1.3);
    hudSprite.scale.set(0.2, 0.2, 0.2);
    hudSprite.parent = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    hud.setComponent(GraphicsData, hudSprite);

    const drawHUD = () => {
      const { canvas, ctx } = GraphicsUtils.scratchCanvasContext(256, 256);
      const score = player.getComponent(ScoreData);
      const health = player.getComponent(HealthData);
      ctx.font = '54px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText(`${health.hp}/${health.max}HP`, canvas.width / 2, 54);
      ctx.fillText(`${score.score} points`, canvas.width / 2, 108);

      hudSprite.material.map = new CanvasTexture(canvas);
      this.graphics.updateMaterial(hudSprite);
    };

    drawHUD();

    // handle impact damage
    playerBody.addEventListener('collide', ({ contact }: any) => {
      const health = player.getComponent(HealthData);
      const impact = contact.getImpactVelocityAlongNormal();

      if (Math.abs(impact) >= 15) {
        health.hp -= Math.floor(Math.abs(impact) / 10);
        drawHUD();
      }
    });

    // handle death
    this.ecs.events.on(`delete${HealthData.name}Component`, (id: number) => {
      const score = player.getComponent(ScoreData);
      if (id === player.id) {
        document.querySelector('#blocker')?.setAttribute('style', 'display:block');
        const loadText = document.querySelector('#load')!;
        loadText.setAttribute('style', 'display:block');
        loadText.innerHTML = `<h1>You Have Perished. Score... ${score.score}</h1>`;
      }
    });

    // attach data to debug GUI
    this.gui.add(playerBody.interpolatedPosition, 'x').listen();
    this.gui.add(playerBody.interpolatedPosition, 'y').listen();
    this.gui.add(playerBody.interpolatedPosition, 'z').listen();
  }
}
