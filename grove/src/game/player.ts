import {
    CameraHelper,
    PerspectiveCamera,
    Sprite,
    SpriteMaterial,
    Vector3,
} from 'three';

import { GameSystem } from '@grove/engine';
import HealthScript, { DeathData } from './health';
import { KeyboardControlData } from './keyboardControls';
import { MovementData } from './movement';
import { PhysicsData } from '@grove/physics';
import { ScoreData } from './score';
import { shoot } from './shooting';
import { CAMERA_TAG, CameraData, SpriteData, MeshData } from '@grove/graphics';
import { UserInterfaceData } from './userInterface';
import { dealDamage } from './damage.system';
import { assetLoader, events, graphics, physics, world, LogService } from '@grove/engine';
import { getEquippedItem } from './inventory';

const [todo] = LogService('engine:todo');

/**
 * Entity tag used to retrieve the player
 * @example Entity.getTag(PLAYER_TAG);
 */
export const PLAYER_TAG = Symbol('player');

/** get a ThreeJS vector pointing outwards from the camera */
const getCameraDir = () => {
    const camera = world.getComponent(world.getTag(CAMERA_TAG), CameraData);
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

export const player = world.createEntity();

world.addTag(player, PLAYER_TAG);

const mesh = await assetLoader.loadModel('./models/villager-male/villager-male.glb')
export const frustumCamera = new PerspectiveCamera(30, 1, 0.1, 10);
mesh.add(frustumCamera);
frustumCamera.rotateY(Math.PI);
frustumCamera.translateY(2);
frustumCamera.rotateX(-Math.PI / 9);
frustumCamera.translateZ(1);
graphics.addObjectToScene(frustumCamera);
graphics.addObjectToScene(mesh);
const helper = new CameraHelper(frustumCamera);
frustumCamera.add(helper);
graphics.addObjectToScene(helper);
// graphics.changeCamera(frustumCamera); // for testing
world.setComponent(player, MeshData, mesh);

world.setComponent(player, HealthScript, new HealthScript(250, 250));

world.setComponent(player, ScoreData, {
    score: 0,
});

// create physics body
const body = physics.createSphere({
    mass: 100,
    pos: [0, 120, 0],
    shouldRotate: false,
    radius: 1
});
const perception = physics.createSphere({
    mass: 100,
    shouldRotate: false,
    radius: 5,
    isGhost: true,
    objectToFollow: body
});
physics.registerCollisionCallback(perception, (entity) => {
    console.log(world.getEntityComponentSignature(entity));
})
world.setComponent(player, PhysicsData, body);

// const cFn = curry(world.setComponent.bind(world));
// const setData = <T extends ComponentType>(type: T): Curried<[data: InstanceType<T>], void> => cFn(this.player.id)(type);
// const setPhysicsData = setData(PhysicsData);
// setPhysicsData(body);

const movementData = new MovementData();
movementData.jumpVelocity = 5;
movementData.walkVelocity = 7;
world.setComponent(player, MovementData, movementData);
world.setComponent(player, KeyboardControlData, {});

const hud = new UserInterfaceData(
    '50%',
    '80%',
    '52px Arial',
    'red',
    'lmoa'
);
world.setComponent(player, UserInterfaceData, hud);

function drawHUD() {
    const score = world.getComponent(player, ScoreData);
    const health = world.getComponent(player, HealthScript);
    // this.hudCtx.font = '52px Arial';
    // this.hudCtx.fillStyle = 'red';
    // this.hudCtx.textAlign = 'center';
    // this.hudCtx.fillText(`${health.hp}/${health.max}HP`, this.hudCanvas.width / 2, this.hudCanvas.height - 62);
    // this.hudCtx.fillText(`${score.score} points`, this.hudCanvas.width / 2, this.hudCanvas.height - 10);

    hud.text = `${health.hp}/${health.max}HP\n${score.score} points`;
}

const crosshair = world.createEntity();
{
    const crosshairSprite = new Sprite(new SpriteMaterial({ color: 'black' }));
    crosshairSprite.scale.set(10, 10, 1);
    crosshairSprite.position.set(0, 0, -1);
    graphics.addObjectToScene(crosshairSprite, true);
    world.setComponent(crosshair, SpriteData, crosshairSprite);
}

const shootTowardsCrosshair = (e: MouseEvent) => {
    if (e.button !== 2) return;
    const item = getEquippedItem();
    if (!item?.ranged) return;
    const onCollide = dealDamage(world)(5);
    const origin = world.getComponent(world.getTag(CAMERA_TAG), CameraData).position;
    shoot(physics, graphics, origin, getCameraDir(), onCollide);
};

events.on('startLoop', () => {
    document.addEventListener('mousedown', shootTowardsCrosshair);
});
events.on('stopLoop', () => {
    document.removeEventListener('mousedown', shootTowardsCrosshair);
});

// handle impact damage
// playerBody.addEventListener('collide', ({ contact }: { contact: ContactEquation }) => {
//     const health = this.world.getComponent(player, HealthData);
//     const impact = contact.getImpactVelocityAlongNormal();

//     if (Math.abs(impact) >= 15) {
//         health.hp -= Math.floor(Math.abs(impact) / 10);
//     }
// });

// handle enemy deaths
const sound = new Audio('/audio/alien.mp3');
sound.volume = 0.5;
world.events.on('enemyDied', async (_entity: number) => {
    // const position = world.getComponent(entity, MeshData).position;
    // const texture = await new TextureLoader().loadAsync('img/fire.png');
    // const emitter = graphics.createParticleEmitter(texture);
    // emitter.position.copy(position);
    const score = world.getComponent(player, ScoreData);
    score.score += 1;
    world.events.emit('updateScore', score);

    sound.play();
});

// heal
world.events.on('healPlayer', (amount: number) => {
    const health = world.getComponent(player, HealthScript);
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
            world.deleteEntity(player);
        });
    }
}
