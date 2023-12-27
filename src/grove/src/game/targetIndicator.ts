import { graphics, physics, world } from "@grove/engine";
import { CameraData } from "@grove/graphics";
import { PhysicsData } from "@grove/physics";
import { Frustum, Matrix4, RepeatWrapping, Sprite, SpriteMaterial, TextureLoader, Vector2, Vector3 } from "three";
import { Slime } from "./slime";
import { Goblin } from "./goblin";

///
///
///

export const TARGET_TAG = Symbol("Target");

const ABILITY_TEXTURE_PATH = 'img/icons.jpg';

const INDICATOR_TEXTURE_PATH = 'img/fire.png';

//

type AbilityList = number;

export type TargetIndicator = {
    sprite: Sprite,
    abilities: AbilityList
}

//

export function makeTargetIndicator(): TargetIndicator {
    const target_sprite = new Sprite(new SpriteMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        visible: true,
        map: new TextureLoader().load(INDICATOR_TEXTURE_PATH),
        depthTest: false
    }));
    target_sprite.position.set(0, 30, 0);
    target_sprite.scale.set(10, 10, 10);
    graphics.addObjectToScene(target_sprite);
    return { sprite: target_sprite, abilities: 0 };
}

//

export function addAbilityToTargetIndicator(target: TargetIndicator) {
    target.abilities++;

    // const ability_texture = new TextureLoader().load('./img/glow.png');
    const ability_texture = new TextureLoader().load(ABILITY_TEXTURE_PATH);
    ability_texture.offset = new Vector2((1 / 10), 1 - (1 / 12));
    // ability_texture.repeat = new Vector2(10, 12);
    ability_texture.wrapS = RepeatWrapping;
    ability_texture.wrapT = RepeatWrapping;

    const ability_sprite = new Sprite(new SpriteMaterial({
        color: 0xffffff,
        transparent: true,
        visible: true,
        map: ability_texture,
        alphaMap: ability_texture,
        depthTest: false
    }));

    const SCALE = 0.1;
    const RADIUS = 0.3;

    // pos
    const angle = (Math.PI / 2) * target.abilities;
    const y_pos = RADIUS * Math.sin(angle);
    const x_pos = RADIUS * Math.cos(angle);
    ability_sprite.position.set(x_pos, y_pos, 0);

    // size
    ability_sprite.scale.set(SCALE, SCALE, SCALE);

    target.sprite.add(ability_sprite);
}

//

// Expensive function call
export function updateTargetIndicator(player: number, camera: CameraData) {
    const [body_player] = world.get(player, [PhysicsData]);
    const [px, py, pz] = physics.getBodyPosition(body_player);
    const pos_player = new Vector3(px, py, pz);

    // : Get target list

    function findEnemies(): Set<number> {
        const enemies = new Set<number>();
        graphics.scene.traverseVisible((node) => {
            const e = node.userData.entityId;

            // Assert existence
            if (!e) { return; }
            // Assert frustum-visible
            const frustum = new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
            if (!frustum.containsPoint(node.position)) { return; }
            // Hostile?
            if (world.has(e, Slime) || world.has(e, Goblin)) {
                enemies.add(e);
            }
        });
        return enemies;
    }

    const enemies = findEnemies();

    let distance_shortest = 999999999;
    for (const enemy of enemies) {
        const [body_enemy] = world.get(enemy, [PhysicsData]);
        const [ex, ey, ez] = physics.getBodyPosition(body_enemy);
        const pos_enemy = new Vector3(ex, ey, ez);
        const distance_to_player = Math.abs(pos_enemy.distanceTo(pos_player));
        if (distance_to_player < distance_shortest) {
            distance_shortest = distance_to_player;
            world.removeTag(TARGET_TAG);
            world.addTag(enemy, TARGET_TAG);
        }
    }
}

//

export function syncTargetIndicator({ sprite }: TargetIndicator) {
    if (world.hasTag(TARGET_TAG)) {
        const enemy_id = world.getTag(TARGET_TAG);
        const [body_enemy] = world.get(enemy_id, [PhysicsData]);
        const [ex, ey, ez] = physics.getBodyPosition(body_enemy);
        const pos_enemy = new Vector3(ex, ey, ez);
        sprite.visible = true;
        sprite.position.copy(pos_enemy);
        sprite.rotateX(0.0333);
        sprite.rotateY(-0.0333);
        sprite.rotateZ(0.0333);
    } else {
        sprite.visible = false;
    }
}