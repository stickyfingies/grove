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
    player: Entity;

    hud: Entity;

    hudCanvas: HTMLCanvasElement;

    hudCtx: CanvasRenderingContext2D;

    init() {
        const { canvas, ctx } = GraphicsUtils.scratchCanvasContext(256, 256);
        this.hudCanvas = canvas;
        this.hudCtx = ctx;

        this.player = new Entity()
            .addTag(PLAYER_TAG);

        this.player.setComponent(HealthData, {
            hp: 100,
            max: 100,
        });

        this.player.setComponent(ScoreData, {
            score: 0,
        });

        // create physics body
        const mass = 100;
        const radius = 1;
        const shape = new Sphere(radius);
        const playerBody = new Body({
            collisionFilterGroup: 2, // separate collision filter for raycasts
            allowSleep: false,
            fixedRotation: true,
            mass,
        });

        playerBody.addShape(shape);
        playerBody.position.y = 12;

        this.player.setComponent(PhysicsData, playerBody);
        this.player.setComponent(MovementData, new MovementData(2.25, 0.7));
        this.player.setComponent(KeyboardControlData, {});

        this.hud = new Entity();

        const hudSprite = new Sprite();
        hudSprite.material = new SpriteMaterial();
        hudSprite.position.set(0, -0.5, -1.3);
        hudSprite.scale.set(0.2, 0.2, 0.2);
        hudSprite.parent = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
        this.hud.setComponent(GraphicsData, hudSprite);

        this.drawHUD();

        // handle impact damage
        playerBody.addEventListener('collide', ({ contact }: any) => {
            const health = this.player.getComponent(HealthData);
            const impact = contact.getImpactVelocityAlongNormal();

            if (Math.abs(impact) >= 15) {
                health.hp -= Math.floor(Math.abs(impact) / 10);
                this.drawHUD();
            }
        });

        // handle enemy deaths
        this.ecs.events.on('enemyDied', () => {
            const score = this.player.getComponent(ScoreData);
            score.score += 1;
            this.drawHUD();
        });

        // heal
        this.ecs.events.on('healPlayer', (amount: number) => {
            const health = this.player.getComponent(HealthData);
            health.hp += amount;
            this.drawHUD();
        });

        // handle death
        this.ecs.events.on(`delete${HealthData.name}Component`, (id: number) => {
            const score = this.player.getComponent(ScoreData);
            if (id === this.player.id) {
                document.querySelector('#blocker')?.setAttribute('style', 'display:block');
                const loadText = document.querySelector('#load')! as HTMLElement;
                loadText.setAttribute('style', 'display:block');
                loadText.innerHTML = `<h1>You Have Perished. Score... ${score.score}</h1>`;
            }
        });

        // attach data to debug GUI
        this.gui.add(playerBody.interpolatedPosition, 'x').listen();
        this.gui.add(playerBody.interpolatedPosition, 'y').listen();
        this.gui.add(playerBody.interpolatedPosition, 'z').listen();
    }

    drawHUD() {
        const score = this.player.getComponent(ScoreData);
        const health = this.player.getComponent(HealthData);
        const hudSprite = this.hud.getComponent(GraphicsData) as Sprite;

        this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
        this.hudCtx.font = '52px Arial';
        this.hudCtx.fillStyle = 'red';
        this.hudCtx.textAlign = 'center';
        this.hudCtx.fillText(`${health.hp}/${health.max}HP`, this.hudCanvas.width / 2, 54);
        this.hudCtx.fillText(`${score.score} points`, this.hudCanvas.width / 2, 108);

        hudSprite.material.map = new CanvasTexture(this.hudCanvas);
        this.graphics.updateMaterial(hudSprite);
    }
}
