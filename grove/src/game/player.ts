import {
    CameraHelper,
    Mesh,
    PerspectiveCamera,
    Sprite,
    SpriteMaterial,
    Vector3,
} from 'three';

import { GameSystem } from '@grove/engine';
import Health, { Death } from './health';
import { KeyboardControls } from './keyboardControls';
import { Movement } from './movement';
import { PhysicsData } from '@grove/physics';
import { Score } from './score';
import { shoot } from './shooting';
import { CAMERA_TAG, CameraData, SpriteData } from '@grove/graphics';
import { UserInterface } from './userInterface';
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
    const [camera] = world.getComponent(world.getTag(CAMERA_TAG), [CameraData]);
    return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
};

export const player = world.createEntity();
world.addTag(player, PLAYER_TAG);

const mesh = await assetLoader.loadModel({ uri: './models/villager-male/villager-male.glb' });

export const frustumCamera = new PerspectiveCamera(30, 1, 0.1, 10)
    .rotateY(Math.PI)
    .translateY(2)
    .rotateX(-Math.PI / 9)
    .translateZ(1);
const helper = new CameraHelper(frustumCamera);
frustumCamera.add(helper);
mesh.add(frustumCamera);

graphics.addObjectToScene(mesh);
// graphics.changeCamera(frustumCamera); // for testing

const health = new Health(250, 250);
const score = {
    score: 0
};

// create physics body
const body = physics.createSphere({
    mass: 100,
    shouldRotate: false,
    isGhost: false,
}, {
    pos: [0, 20, 0],
    scale: [1, 1, 1],
    quat: [0, 0, 0, 1]
}, {
    radius: 1
});
// const perception = physics.createSphere({
//     mass: 100,
//     shouldRotate: false,
//     radius: 5,
//     isGhost: true,
//     objectToFollow: body
// });
// physics.registerCollisionCallback(perception, (entity) => {
//     // console.log(world.getEntityComponentSignature(entity));
// })

// const cFn = curry(world.setComponent.bind(world));
// const setData = <T extends ComponentType>(type: T): Curried<[data: InstanceType<T>], void> => cFn(this.player.id)(type);
// const setPhysicsData = setData(PhysicsData);
// setPhysicsData(body);

const mvmtData = new Movement();
mvmtData.jumpVelocity = 5;
mvmtData.walkVelocity = 7;
const kbControl = {};

// createUserInterface({ x, y, font, color, text });

const hud = new UserInterface(
    '50%',
    '80%',
    '52px Arial',
    'red',
    '[health goes here]'
);

world.setComponent(player,
    [Mesh, PhysicsData, Health, Score, Movement, KeyboardControls, UserInterface],
    [mesh, body, health, score, mvmtData, kbControl, hud]
);

function drawHUD() {
    const [score, health] = world.getComponent(player, [Score, Health]);
    hud.text = `${health.hp}/${health.max}HP\n${score.score} points`;
}

const crosshair = world.createEntity();
{
    const crosshairSprite = new Sprite(new SpriteMaterial({ color: 'black' }));
    crosshairSprite.scale.set(10, 10, 1);
    crosshairSprite.position.set(0, 0, -1);
    graphics.addObjectToScene(crosshairSprite, true);
    world.setComponent(crosshair, [SpriteData], [crosshairSprite]);
}

const shootTowardsCrosshair = (e: MouseEvent) => {
    if (e.button !== 2) return;
    const item = getEquippedItem();
    if (!item?.ranged) return;
    const onCollide = dealDamage(world)(5);
    const [{ position: origin }] = world.getComponent(world.getTag(CAMERA_TAG), [CameraData]);
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
world.events.on('enemyDied', async () => {
    // const position = world.getComponent(entity, MeshData).position;
    // const texture = await new TextureLoader().loadAsync('img/fire.png');
    // const emitter = graphics.createParticleEmitter(texture);
    // emitter.position.copy(position);
    const [score] = world.getComponent(player, [Score]);
    score.score += 1;
    world.events.emit('updateScore', score);

    sound.play();
});

// heal
world.events.on('healPlayer', (amount: number) => {
    const [health] = world.getComponent(player, [Health]);
    health.hp += amount;
});

todo('imgui: display player position');
// this.gui.add(body.position, 'x').listen();
// this.gui.add(body.position, 'y').listen();
// this.gui.add(body.position, 'z').listen();

export default class PlayerScript extends GameSystem {
    every_frame() {
        drawHUD();
        world.executeQuery([Score, Death], ([{ score }]) => {
            document.querySelector('#blocker')?.setAttribute('style', 'display:block');
            const loadText = document.querySelector('#load')! as HTMLElement;
            loadText.setAttribute('style', 'display:block');
            loadText.innerHTML = `<h1>You Have Perished. Score... ${score}</h1>`;
            world.deleteEntity(player);
        });
    }
}
