import {
    Sprite,
    SpriteMaterial,
    Vector3,
} from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { DeathData, HealthData } from './health';
import { KeyboardControlData } from './keyboardControls';
import { MovementData } from './movement';
import { PhysicsData } from 'firearm';
import { ScoreData } from './score';
import { shoot } from './shooting';
import { CAMERA_TAG, CameraData, SpriteData, MeshData } from '3-AD';
import LogService from '../log';
import { UserInterfaceData } from './userInterface';
import { addDamageCallback, dealDamage } from './damage.system';

const [todo] = LogService('engine:todo');

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

    // hud!: Entity;

    // hudCanvas!: HTMLCanvasElement;

    // hudCtx!: CanvasRenderingContext2D;

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
            const onCollide = dealDamage(this.ecs)(5);
            const origin = this.physics.getBodyPosition(this.player.getComponent(PhysicsData));
            shoot(this.physics, this.graphics, new Vector3().fromArray(origin), getCameraDir(), onCollide);
        };

        this.engine.events.on('startLoop', () => {
            document.addEventListener('mousedown', shootTowardsCrosshair);
        });
        this.engine.events.on('stopLoop', () => {
            document.removeEventListener('mousedown', shootTowardsCrosshair);
        });

        // scratch canvas context
        // const RESOLUTION = 256;
        // const canvas = document.createElement('canvas');
        // canvas.width = RESOLUTION;
        // canvas.height = RESOLUTION;
        // const ctx = canvas.getContext('2d')!;
        // this.hudCanvas = canvas;
        // this.hudCtx = ctx;

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
            pos: [0, 120, 0],
            fixedRotation: true,
        }, radius);
        this.player.setComponent(PhysicsData, body);

        const movementData = new MovementData();
        movementData.jumpVelocity = 5;
        movementData.walkVelocity = 7;
        this.player.setComponent(MovementData, movementData);
        this.player.setComponent(KeyboardControlData, {});

        // this.hud = new Entity();

        // const hudSprite = new Sprite();
        // hudSprite.material = new SpriteMaterial();
        // hudSprite.position.set(0, -window.innerHeight / 2 + this.hudCanvas.height / 2, -1);
        // hudSprite.scale.set(256, 256, 1);
        // this.graphics.addObjectToScene(hudSprite, true);
        // this.hud.setComponent(SpriteData, hudSprite);

        this.player.setComponent(UserInterfaceData, new UserInterfaceData(
            '50%',
            '80%',
            '52px Arial',
            'red',
            'lmoa'
        ));

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
        this.ecs.events.on('enemyDied', (entity: number) => {
            const position = this.ecs.getComponent(entity, MeshData)!.position;
            this.graphics.createParticleSystem(position);
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

        // re-draw HUD upon getting hit
        addDamageCallback(this.player.id, this.drawHUD);

        // handle death
        // this.ecs.events.on(`delete${HealthData.name}Component`, (id: number) => {
        //     const score = this.player.getComponent(ScoreData);
        //     if (id === this.player.id) {
        //         document.querySelector('#blocker')?.setAttribute('style', 'display:block');
        //         const loadText = document.querySelector('#load')! as HTMLElement;
        //         loadText.setAttribute('style', 'display:block');
        //         loadText.innerHTML = `<h1>You Have Perished. Score... ${score.score}</h1>`;
        //         this.ecs.deleteEntity(this.player.id);
        //     }
        // });

        // attach data to debug GUI

        todo('imgui: display player position');
        // this.gui.add(body.position, 'x').listen();
        // this.gui.add(body.position, 'y').listen();
        // this.gui.add(body.position, 'z').listen();
    }

    update() {
        this.ecs.executeQuery([ScoreData, DeathData], ([score]) => {
            document.querySelector('#blocker')?.setAttribute('style', 'display:block');
            const loadText = document.querySelector('#load')! as HTMLElement;
            loadText.setAttribute('style', 'display:block');
            loadText.innerHTML = `<h1>You Have Perished. Score... ${score.score}</h1>`;
            this.ecs.deleteEntity(this.player.id);
        });
    }

    drawHUD() {
        const score = this.player.getComponent(ScoreData);
        const health = this.player.getComponent(HealthData);
        const hud = this.player.getComponent(UserInterfaceData);
        // this.hudCtx.font = '52px Arial';
        // this.hudCtx.fillStyle = 'red';
        // this.hudCtx.textAlign = 'center';
        // this.hudCtx.fillText(`${health.hp}/${health.max}HP`, this.hudCanvas.width / 2, this.hudCanvas.height - 62);
        // this.hudCtx.fillText(`${score.score} points`, this.hudCanvas.width / 2, this.hudCanvas.height - 10);

        hud.text = `${health.hp}/${health.max}HP\n${score.score} points`;
    }
}
