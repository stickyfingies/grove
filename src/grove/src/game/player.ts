import {
    Frustum,
    Matrix4,
    Mesh,
    Model,
    PerspectiveCamera,
    Sprite,
    SpriteMaterial,
    Vector3,
} from 'three';

import { GameSystem } from '@grove/engine';
import {Health, Death } from './health';
import { KeyboardControls } from './keyboardControls';
import { Movement } from './movement';
import { PhysicsData } from '@grove/physics';
import { Score } from './score';
import { shoot } from './shooting';
import { CAMERA_TAG, CameraData, SpriteData, animate } from '@grove/graphics';
import { UserInterface } from './userInterface';
import { dealDamage } from './damage.system';
import { events, graphics, physics, world, LogService } from '@grove/engine';
import { getEquippedItem } from './inventory';
import { addAbilityToTargetIndicator, makeTargetIndicator, syncTargetIndicator, updateTargetIndicator } from './targetIndicator';

const [todo] = LogService('engine:todo');

/**
 * Entity tag used to retrieve the player
 * @example Entity.getTag(PLAYER_TAG);
 */
export const PLAYER_TAG = Symbol('player');

/** get a ThreeJS vector pointing outwards from the camera */
const getCameraDir = () => {
    const [camera] = world.get(world.getTag(CAMERA_TAG), [CameraData]);
    return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
};

export const player = world.createEntity();
world.addTag(player, PLAYER_TAG);

export const frustumCamera = new PerspectiveCamera(30, 1, 0.1, 100)
    .rotateY(Math.PI)
    .translateY(3)
    .rotateX(-Math.PI / 9)
    .translateZ(1);

let g_model: Model = null;

// const mesh = await assetLoader.loadModel({ uri: './models/villager-male/villager-male.glb' });
graphics.loadModel().then((model) => {

    g_model = model;

    const mesh = model.mesh;
    console.log(model.animations);
    animate(model, 'Idle');

    mesh.add(frustumCamera);

    // const helper = new CameraHelper(frustumCamera);
    // frustumCamera.add(helper);
    // graphics.changeCamera(frustumCamera); // for testing

    const DELAY_BETWEEN_SWINGS = 800; // milliseconds
    const DAMAGE = 10; // ???
    const hit_sound = new Audio('audio/squelch.mp3');
    let lastSwung = 0;
    document.addEventListener('mousedown', async (e) => {
        if (e.button !== 0) return;

        if (performance.now() - lastSwung < DELAY_BETWEEN_SWINGS) return;

        lastSwung = performance.now();

        animatePlayer('1H_Melee_Attack_Slice_Diagonal');
        setTimeout(() => animatePlayer('Idle'), 340);

        const frustum = new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(frustumCamera.projectionMatrix, frustumCamera.matrixWorldInverse));
        let foundTarget = false;
        graphics.scene.traverseVisible((node) => {
            if (foundTarget) return;
            if (node.isMesh && (frustum.containsPoint(node.position) || frustum.intersectsObject(node))) {
                if (world.has(node.userData.entityId, Health)) {
                    foundTarget = true;

                    setTimeout(() => {
                        const damage = getEquippedItem()?.damage ?? DAMAGE;
                        dealDamage(world)(damage)(node.userData.entityId);

                        hit_sound.currentTime = 0.5;
                        hit_sound.play();
                    }, 500);

                }
            }
        });
    });

    const health = new Health(250, 250);
    const score = {
        score: 0
    };

    // create physics body
    const body = physics.createSphere({
        mass: 100,
        shouldRotate: true,
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
    mvmtData.walkVelocity = 14;
    const kbControl = new KeyboardControls({
        'MoveForward': ['w_down'],
        'MoveBackward': ['s_down'],
        'MoveLeft': ['a_down'],
        'MoveRight': ['d_down'],
        'Idle': ['w_up', 'a_up', 's_up', 'd_up']
    });
    kbControl.addListener('Idle', () => {
        animatePlayer('Idle');
    });
    kbControl.addListener('MoveForward', () => {
        animatePlayer('Running_A');
    });
    kbControl.addListener('MoveBack', () => {
        animatePlayer('Running_A');
    });
    kbControl.addListener('MoveLeft', () => {
        animatePlayer('Running_A');
    });
    kbControl.addListener('MoveRight', () => {
        animatePlayer('Running_A');
    });

    // createUserInterface({ x, y, font, color, text });

    const hud = new UserInterface(
        '50%',
        '80%',
        '52px Arial',
        'red',
        '[health goes here]'
    );

    world.put(player,
        [Mesh, PhysicsData, Health, Score, Movement, KeyboardControls, UserInterface],
        [mesh, body, health, score, mvmtData, kbControl, hud]
    );

    const crosshairSprite = new Sprite(new SpriteMaterial({ color: 'black' }));
    crosshairSprite.scale.set(10, 10, 1);
    crosshairSprite.position.set(0, 0, -1);
    const crosshair = world.spawn([SpriteData], [crosshairSprite]);

    const shootTowardsCrosshair = (e: MouseEvent) => {
        if (e.button !== 2) return;

        animatePlayer('1H_Ranged_Aiming');
        setTimeout(() => animatePlayer('Idle'), 2000);

        // const item = getEquippedItem();
        // if (!item?.ranged) return;
        const onCollide = dealDamage(world)(5);
        const [{ position: origin }] = world.get(world.getTag(CAMERA_TAG), [CameraData]);
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
    const sound = new Audio('audio/boop.wav');
    sound.volume = 0.5;
    world.events.on('enemyDied', async () => {
        // const position = world.getComponent(entity, MeshData).position;
        // const texture = await new TextureLoader().loadAsync('img/fire.png');
        // const emitter = graphics.createParticleEmitter(texture);
        // emitter.position.copy(position);
        const [score] = world.get(player, [Score]);
        score.score += 1;
        world.events.emit('updateScore', score);

        sound.play();
    });

    // heal
    world.events.on('healPlayer', (amount: number) => {
        const [health] = world.get(player, [Health]);
        health.hp += amount;
    });

    todo('imgui: display player position');

});

function drawHUD() {
    const [score, health, hud] = world.get(player, [Score, Health, UserInterface]);
    hud.text = `${health.hp}/${health.max}HP\n${score.score} points`;
}

export function animatePlayer(anim_name: string) {
    animate(g_model, anim_name);
}

const target_sprite = makeTargetIndicator();

addAbilityToTargetIndicator(target_sprite);
addAbilityToTargetIndicator(target_sprite);
addAbilityToTargetIndicator(target_sprite);
addAbilityToTargetIndicator(target_sprite);

/**
 * Delta: (-Entity)
 */
world.addRule({
    name: 'Game-over',
    types: [Score, Death],
    fn([score]) {
        document.querySelector('#blocker')?.setAttribute('style', 'display:block');
        const loadText = document.querySelector('#load')! as HTMLElement;
        loadText.setAttribute('style', 'display:block');
        loadText.innerHTML = `<h1>You Have Perished. Score... ${score}</h1>`;
        world.deleteEntity(player);
    }
});

export default class PlayerScript extends GameSystem {
    every_frame() {

        drawHUD();

        if (Math.random() < 0.5) {
            updateTargetIndicator(player, frustumCamera);
        }

        syncTargetIndicator(target_sprite);
    }
}