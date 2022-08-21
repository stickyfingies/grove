import {
    Sprite,
    SpriteMaterial,
    TextureLoader,
    Vector3,
} from 'three';

import Entity from '../ecs/entity';
import { GameSystem } from '../script';
import HealthScript, { DeathData } from './health';
import { KeyboardControlData } from './keyboardControls';
import { MovementData } from './movement';
import { PhysicsData } from 'firearm';
import { ScoreData } from './score';
import { shoot } from './shooting';
import { CAMERA_TAG, CameraData, SpriteData, MeshData } from '3-AD';
import LogService from '../log';
import { UserInterfaceData } from './userInterface';
import { dealDamage } from './damage.system';
import { events, graphics, physics, world } from '../engine';
import { getEquippedItem } from './inventory';

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

// scratch canvas context
// const RESOLUTION = 256;
// const canvas = document.createElement('canvas');
// canvas.width = RESOLUTION;
// canvas.height = RESOLUTION;
// const ctx = canvas.getContext('2d')!;
// this.hudCanvas = canvas;
// this.hudCtx = ctx;

export const player = new Entity();

player.addTag(PLAYER_TAG);

player.setComponent(HealthScript, new HealthScript(250, 250));

player.setComponent(ScoreData, {
    score: 0,
});

// create physics body
const mass = 100;
const radius = 1;
const body = physics.createSphere({
    mass,
    pos: [0, 120, 0],
    fixedRotation: true,
    radius
});
player.setComponent(PhysicsData, body);

// const cFn = curry(world.setComponent.bind(world));
// const setData = <T extends ComponentType>(type: T): Curried<[data: InstanceType<T>], void> => cFn(this.player.id)(type);
// const setPhysicsData = setData(PhysicsData);
// setPhysicsData(body);

const movementData = new MovementData();
movementData.jumpVelocity = 5;
movementData.walkVelocity = 7;
player.setComponent(MovementData, movementData);
player.setComponent(KeyboardControlData, {});

const hud = new UserInterfaceData(
    '50%',
    '80%',
    '52px Arial',
    'red',
    'lmoa'
);
player.setComponent(UserInterfaceData, hud);

function drawHUD() {
    const score = player.getComponent(ScoreData);
    const health = player.getComponent(HealthScript);
    // this.hudCtx.font = '52px Arial';
    // this.hudCtx.fillStyle = 'red';
    // this.hudCtx.textAlign = 'center';
    // this.hudCtx.fillText(`${health.hp}/${health.max}HP`, this.hudCanvas.width / 2, this.hudCanvas.height - 62);
    // this.hudCtx.fillText(`${score.score} points`, this.hudCanvas.width / 2, this.hudCanvas.height - 10);

    hud.text = `${health.hp}/${health.max}HP\n${score.score} points`;
}

const crosshair = new Entity();
{
    const crosshairSprite = new Sprite(new SpriteMaterial({ color: 'black' }));
    crosshairSprite.scale.set(10, 10, 1);
    crosshairSprite.position.set(0, 0, -1);
    graphics.addObjectToScene(crosshairSprite, true);
    crosshair.setComponent(SpriteData, crosshairSprite);
}

const shootTowardsCrosshair = (e: MouseEvent) => {
    if (e.button !== 2) return;
    const item = getEquippedItem();
    if (!item?.ranged) return;
    const onCollide = dealDamage(world)(5);
    const origin = physics.getBodyPosition(player.getComponent(PhysicsData));
    shoot(physics, graphics, new Vector3().fromArray(origin), getCameraDir(), onCollide);
};

events.on('startLoop', () => {
    document.addEventListener('mousedown', shootTowardsCrosshair);
});
events.on('stopLoop', () => {
    document.removeEventListener('mousedown', shootTowardsCrosshair);
});

// handle impact damage
// playerBody.addEventListener('collide', ({ contact }: { contact: ContactEquation }) => {
//     const health = this.player.getComponent(HealthData);
//     const impact = contact.getImpactVelocityAlongNormal();

//     if (Math.abs(impact) >= 15) {
//         health.hp -= Math.floor(Math.abs(impact) / 10);
//     }
// });

// handle enemy deaths
const sound = new Audio('/audio/alien.mp3');
sound.volume = 0.5;
world.events.on('enemyDied', async (entity: number) => {
    const position = world.getComponent(entity, MeshData).position;
    const texture = await new TextureLoader().loadAsync('img/fire.png');
    const emitter = graphics.createParticleEmitter(texture);
    emitter.position.copy(position);
    const score = player.getComponent(ScoreData);
    score.score += 1;
    world.events.emit('updateScore', score);

    sound.play();
});

// heal
world.events.on('healPlayer', (amount: number) => {
    const health = player.getComponent(HealthScript);
    health.hp += amount;
});

todo('imgui: display player position');
// this.gui.add(body.position, 'x').listen();
// this.gui.add(body.position, 'y').listen();
// this.gui.add(body.position, 'z').listen();

export default class PlayerScript extends GameSystem {
    every_frame() {
        drawHUD();
        world.executeQuery([ScoreData, DeathData], ([{ score }]) => {
            document.querySelector('#blocker')?.setAttribute('style', 'display:block');
            const loadText = document.querySelector('#load')! as HTMLElement;
            loadText.setAttribute('style', 'display:block');
            loadText.innerHTML = `<h1>You Have Perished. Score... ${score}</h1>`;
            world.deleteEntity(player.id);
        });
    }
}
