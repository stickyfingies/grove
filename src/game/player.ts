import { Vec3 } from 'cannon-es';
import {
    CanvasTexture,
    Sprite,
    SpriteMaterial,
    Vector3,
} from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import GraphicsUtils from '../graphics/utils';
import { HealthData } from './health';
import { KeyboardControlData } from './keyboardControls';
import { MovementData } from './movement';
import { PhysicsData } from '../physics';
import { ScoreData } from './score';
import { shoot } from './shooting';
import { CAMERA_TAG, CameraData, SpriteData } from '../graphics/graphics';

/**
 * Entity tag used to retrieve the player
 * @example Entity.getTag(PLAYER_TAG);
 */
export const PLAYER_TAG = Symbol('player');

/** get a ThreeJS vector pointing outwards from the camera */
const getCameraDir = () => {
    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
};

export default class PlayerScript extends GameScript {
    player!: Entity;

    hud!: Entity;

    hudCanvas!: HTMLCanvasElement;

    hudCtx!: CanvasRenderingContext2D;

    init() {
        const crosshair = new Entity();
        {
            const crosshairSprite = new Sprite(new SpriteMaterial({ color: 'black' }));
            crosshairSprite.scale.set(10, 10, 1);
            crosshairSprite.position.set(0, 0, -1);
            this.graphics.addObjectToScene(crosshairSprite, true);
            crosshair.setComponent(SpriteData, crosshairSprite);
        }

        const shootTowardsCrosshair = (e: MouseEvent) => {
            if (e.button !== 2) return;
            shoot(this.physics, this.graphics, Entity.getTag(PLAYER_TAG), getCameraDir());
        };

        this.engine.events.on('startLoop', () => {
            document.addEventListener('mousedown', shootTowardsCrosshair);
        });
        this.engine.events.on('stopLoop', () => {
            document.removeEventListener('mousedown', shootTowardsCrosshair);
        });

        const { canvas, ctx } = GraphicsUtils.scratchCanvasContext(256, 256);
        this.hudCanvas = canvas;
        this.hudCtx = ctx;

        this.player = new Entity();
        this.player.addTag(PLAYER_TAG);

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
        const body = this.physics.createSphere({
            mass,
            pos: new Vec3(12, 120, 0),
            fixedRotation: true,
        }, radius);
        this.player.setComponent(PhysicsData, body);

        const movementData = new MovementData();
        movementData.jumpVelocity = 0.5;
        movementData.walkVelocity = 7;
        this.player.setComponent(MovementData, movementData);
        this.player.setComponent(KeyboardControlData, {});

        this.hud = new Entity();

        const hudSprite = new Sprite();
        hudSprite.material = new SpriteMaterial();
        hudSprite.position.set(0, -window.innerHeight / 2 + this.hudCanvas.height / 2, -1);
        hudSprite.scale.set(256, 256, 1);
        this.graphics.addObjectToScene(hudSprite, true);
        this.hud.setComponent(SpriteData, hudSprite);

        this.drawHUD();

        // handle impact damage
        // playerBody.addEventListener('collide', ({ contact }: { contact: ContactEquation }) => {
        //     const health = this.player.getComponent(HealthData);
        //     const impact = contact.getImpactVelocityAlongNormal();

        //     if (Math.abs(impact) >= 15) {
        //         health.hp -= Math.floor(Math.abs(impact) / 10);
        //         this.drawHUD();
        //     }
        // });

        // handle enemy deaths
        this.ecs.events.on('enemyDied', () => {
            const score = this.player.getComponent(ScoreData);
            score.score += 1;
            this.ecs.events.emit('updateScore', score);
            this.drawHUD();
        });

        // heal
        this.ecs.events.on('healPlayer', (amount: number) => {
            const health = this.player.getComponent(HealthData);
            health.hp += amount;
            this.drawHUD();
        });

        this.ecs.events.on('dealDamage', (id: number, dmg: number) => {
            if (id !== this.player.id) return;

            this.player.getComponent(HealthData).hp -= dmg;
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
        this.gui.add(body.position, 'x').listen();
        this.gui.add(body.position, 'y').listen();
        this.gui.add(body.position, 'z').listen();
    }

    drawHUD() {
        const score = this.player.getComponent(ScoreData);
        const health = this.player.getComponent(HealthData);
        const hudSprite = this.hud.getComponent(SpriteData) as Sprite;

        this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
        this.hudCtx.font = '52px Arial';
        this.hudCtx.fillStyle = 'red';
        this.hudCtx.textAlign = 'center';
        this.hudCtx.fillText(`${health.hp}/${health.max}HP`, this.hudCanvas.width / 2, this.hudCanvas.height - 62);
        this.hudCtx.fillText(`${score.score} points`, this.hudCanvas.width / 2, this.hudCanvas.height - 10);

        hudSprite.material.map = new CanvasTexture(this.hudCanvas);
        this.graphics.updateMaterial(hudSprite, true);
    }
}