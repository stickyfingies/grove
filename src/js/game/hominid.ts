/**
 * Known bugs
 * ==========
 * - Hominids continue to spawn when the game is paused
 * - Dead hominids dissappear after 2 seconds, regardless if the game is paused
 */

import {
    CanvasTexture,
    Color,
    Mesh,
    MeshPhongMaterial,
    Sprite,
    SpriteMaterial,
    Vector3,
} from 'three';
import { ContactEquation, Vec3 } from 'cannon-es';

import EcsView from '../ecs/view';
import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { HealthData } from './health';
import { MovementData } from './movement';
import { PLAYER_TAG } from './player';
import shoot from './shooting';
import { ConstraintData, Physics, PhysicsData } from '../physics';

/**
 * This component should be added to the torso of the hominid.
 * Its primary function is to represent the heirarchy of body parts.
 */
class HominidData {
    // personal space bubble around the player at which hominids will stop approaching
    bubble: number;

    // the torso entity (which this component should be attached to)
    torso: Entity;

    // the head entity
    head: Entity;

    // ui element floating above the hominid's head
    halo: Entity;
}

export default class HominidScript extends GameScript {
    hominidView = new EcsView(this.ecs, new Set([HominidData, HealthData]));

    init() {
        this.gui.add(this, 'createHominid').name('Spawn Hominid');

        // put a few hominids somewhere random on the map
        const spawn = () => {
            const spawnCount = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < spawnCount; i++) {
                this.createHominid();
            }
        };

        // spawn some at the beginning
        spawn();

        // and spawn more every 45 seconds
        setInterval(spawn, 45_000);

        this.ecs.events.on('dealDamage', (id: number) => {
            const entity = new Entity(Entity.defaultManager, id);
            if (!entity.hasComponent(HominidData)) return;

            const { torso } = entity.getComponent(HominidData);
            const health = torso.getComponent(HealthData);
            if (!health) return;
            health.hp -= 999999;
        });

        // when something dies...
        this.ecs.events.on(`delete${HealthData.name}Component`, (id: number) => {
            // make sure it's really a hominid (this is a generic death event)
            const entity = new Entity(Entity.defaultManager, id);
            if (!entity.hasComponent(HominidData)) return;

            // extract relevant component data
            const { torso, head, halo } = entity.getComponent(HominidData);
            const torsoBody = torso.getComponent(PhysicsData);
            const headBody = head.getComponent(PhysicsData);
            const torsoMesh = torso.getComponent(GraphicsData) as Mesh;
            // const headMesh = head.getComponent(GraphicsData) as Mesh;

            // increment player score
            this.ecs.events.emit('enemyDied');

            // change body part physics properties
            torsoBody.angularDamping = 0.8;
            torsoBody.fixedRotation = false;
            torsoBody.updateMassProperties();
            torsoBody.allowSleep = true;
            headBody.allowSleep = true;

            // change body part graphics properties
            (torsoMesh.material as MeshPhongMaterial).color = new Color(0x222222);
            this.graphics.updateMaterial(torsoMesh);
            // (headMesh.material as MeshPhongMaterial).color = new Color(0x222222);
            // this.graphics.updateMaterial(headMesh);

            // decapitate >:)
            setTimeout(() => head.deleteComponent(ConstraintData), 50);
            halo.delete();

            // delete corpse after 10 seconds
            setTimeout(() => {
                head.delete();
                torso.delete();
            }, 10_000);
        });
    }

    update(dt: number) {
        // `hominid` is the torso
        this.hominidView.iterateView((hominid) => {
            const player = Entity.getTag(PLAYER_TAG);
            const { bubble, head } = hominid.getComponent(HominidData);

            const playerPhysics = player.getComponent(PhysicsData);
            const hominidPhysics = hominid.getComponent(PhysicsData);
            const mvmt = hominid.getComponent(MovementData);

            // TODO vector utils could simplify this
            const playerPosC = playerPhysics.interpolatedPosition;
            const hominidPosC = hominidPhysics.interpolatedPosition;
            const playerPos = new Vector3(playerPosC.x, playerPosC.y, playerPosC.z);
            const hominidPos = new Vector3(hominidPosC.x, hominidPosC.y, hominidPosC.z);

            // walk towards player if not too close
            const isOutsideBubble = (playerPos.distanceTo(hominidPos) >= bubble);
            mvmt.direction = isOutsideBubble
                ? new Vector3().subVectors(playerPos, hominidPos)
                : new Vector3(0, 0, 0);

            // look at player, menacingly
            head.getComponent(GraphicsData).lookAt(playerPos);

            // shoot at player
            if (hominidPos.distanceTo(playerPos) <= bubble + 3 && Math.random() < 0.01) {
                const shootDir = hominidPos.subVectors(playerPos, hominidPos).normalize();
                const ball = shoot(hominid, shootDir);
                ((ball.getComponent(GraphicsData) as Mesh).material as MeshPhongMaterial).color = new Color('#EE5A24');
                this.graphics.updateMaterial(ball.getComponent(GraphicsData) as Mesh);
            }
        });
    }

    async createHominid() {
        const headRadius = 0.18;
        const torsoRadius = 0.2;
        const height = 0.7;
        const torsoMass = 3;
        const headMass = 1;
        const color = '#EA2027';

        // =====
        // Torso
        // =====

        const torso = new Entity();

        const randomPos = () => Math.random() * 150 - 75;

        const torsoBody = Physics.makeCapsule(torsoMass, torsoRadius, height);
        torsoBody.allowSleep = false;
        torsoBody.position.set(randomPos(), 30, randomPos());
        torsoBody.fixedRotation = true;
        torsoBody.updateMassProperties();
        torso.setComponent(PhysicsData, torsoBody);

        const torsoMesh = GraphicsUtils.makeCylinder(torsoRadius, height + torsoRadius * 2);
        torsoMesh.name = 'Torso';
        torsoMesh.material.color = new Color(color);
        torsoMesh.position.set(torsoBody.position.x, torsoBody.position.y, torsoBody.position.z);
        torso.setComponent(GraphicsData, torsoMesh);

        torso.setComponent(MovementData, new MovementData(3, 1.5));

        torso.setComponent(HealthData, {
            hp: 5, max: 5,
        });

        // ====
        // Head
        // ====

        const head = new Entity();

        const headBody = Physics.makeBall(headMass, headRadius);
        headBody.linearDamping = 0.9;
        headBody.allowSleep = false;
        headBody.position.copy(torsoBody.position);
        headBody.position.y += height / 2 + headRadius;
        head.setComponent(PhysicsData, headBody);

        // The `head` model contains a light, a camera, a sphere, and a sprite?
        const headModel = await this.assetLoader.loadModel('/models/head/head.glb');
        const headMesh = headModel;// .children[2];
        headMesh.name = 'Head';
        // @ts-ignore TODO why was I cloning the material here?
        // headMesh.material = headMesh.material.clone();
        headMesh.userData.norotate = true;
        head.setComponent(GraphicsData, headMesh);

        // ====
        // Neck
        // ====

        const neck = new ConstraintData(
            headBody,
            new Vec3(0, 0, 0),
            torsoBody,
            new Vec3(0, height + headRadius * 1.5, 0),
            4,
        );
        neck.collideConnected = false;
        head.setComponent(ConstraintData, neck);

        // ====
        // Halo
        // ====

        const halo = new Entity();

        const drawHaloTexture = () => {
            const { canvas, ctx } = GraphicsUtils.scratchCanvasContext(256, 256);
            const health = torso.getComponent(HealthData);
            ctx.font = '60px Arial';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText(`${health.hp}/${health.max}`, 128, 128);
            return new CanvasTexture(canvas);
        };

        const haloSprite = new Sprite();
        haloSprite.material = new SpriteMaterial({ map: drawHaloTexture(), color: 0x55ff55 });
        haloSprite.scale.set(2, 2, 2);
        haloSprite.position.y += headRadius * 2;
        haloSprite.parent = head.getComponent(GraphicsData);
        halo.setComponent(GraphicsData, haloSprite);

        torso.setComponent(HominidData, {
            bubble: 15,
            torso,
            head,
            halo,
        });

        // headshots deal damage
        headBody.addEventListener('collide', ({ contact }: { contact: ContactEquation }) => {
            const health = torso.getComponent(HealthData);
            const impact = contact.getImpactVelocityAlongNormal();

            if (Math.abs(impact) >= 15 && torso.hasComponent(HealthData)) {
                health.hp -= Math.floor(Math.abs(impact) / 10);
                haloSprite.material.map = drawHaloTexture();
                haloSprite.material.opacity = health.hp / health.max;
                this.graphics.updateMaterial(haloSprite);
            }
        });
    }
}
