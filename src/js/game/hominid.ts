import { ContactEquation, Vec3 } from 'cannon-es';
import {
  Color, Mesh, SpriteMaterial, Sprite, CanvasTexture, Vector3, MeshPhongMaterial,
} from 'three';
import { Entity } from '../entities';
import { GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { ConstraintData, Physics, PhysicsData } from '../physics';
import { HealthData } from './health';
import GameScript from '../script';
import { shoot } from './shooting';
import ScoreData from './score';
import { PLAYER_TAG } from './player';
import { MovementData } from './movement';

/**
 * This component should be added to the torso of the hominid.
 * Its primary function is to represent the heirarchy of body parts.
 */
class HominidData {
  // personal space bubble around the player at which hominids will stop approaching
  // ? follow component?
  bubble: number;

  // the torso entity (which this component should be attached to)
  torso: Entity;

  // the head entity
  head: Entity;

  // ui element floating above the hominid's head
  halo: Entity;
}

export default class HominidScript extends GameScript {
  queries = new Set([HominidData, HealthData]);

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

    // and spawn more every 12 seconds
    setInterval(spawn.bind(this), 12_000);

    // when a hominid dies...
    this.ecs.events.on(`delete${HealthData.name}Component`, (id: number) => {
      // make sure it's really a hominid (this is a generic death event)
      const entity = new Entity(Entity.defaultManager, id);
      if (!entity.hasComponent(HominidData)) return;

      // extract relevant component data
      const { torso, head, halo } = entity.getComponent(HominidData);
      const torsoBody = torso.getComponent(PhysicsData);
      const headBody = head.getComponent(PhysicsData);
      const torsoMesh = torso.getComponent(GraphicsData) as Mesh;
      const headMesh = head.getComponent(GraphicsData) as Mesh;

      // increment player score
      const player = Entity.getTag(PLAYER_TAG);
      const playerScore = player.getComponent(ScoreData);
      playerScore.score += 1;

      // change body part physics properties
      torsoBody.angularDamping = 0.8;
      torsoBody.fixedRotation = false;
      torsoBody.updateMassProperties();
      torsoBody.allowSleep = true;
      headBody.allowSleep = true;

      // change body part graphics properties
      (torsoMesh.material as MeshPhongMaterial).color = new Color(0x222222);
      this.graphics.updateMaterial(torsoMesh);
      (headMesh.material as MeshPhongMaterial).color = new Color(0x222222);
      this.graphics.updateMaterial(headMesh);

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

  // `hominid` is the torso
  // eslint-disable-next-line class-methods-use-this
  update(dt: number, hominid: Entity) {
    const player = Entity.getTag(PLAYER_TAG);
    const { bubble } = hominid.getComponent(HominidData);

    const playerPhysics = player.getComponent(PhysicsData);
    const hominidPhysics = hominid.getComponent(PhysicsData);
    const mvmt = hominid.getComponent(MovementData);

    const playerPosC = playerPhysics.interpolatedPosition;
    const hominidPosC = hominidPhysics.interpolatedPosition;
    const playerPos = new Vector3(playerPosC.x, playerPosC.y, playerPosC.z);
    const hominidPos = new Vector3(hominidPosC.x, hominidPosC.y, hominidPosC.z);

    const outsideBubble = (playerPos.distanceTo(hominidPos) >= bubble);
    mvmt.direction = outsideBubble
      ? new Vector3().subVectors(playerPos, hominidPos)
      : new Vector3(0, 0, 0);

    const hp = new Vector3(hominidPos.x, hominidPos.y, hominidPos.z); // hominid pos
    const pp = new Vector3(playerPos.x, playerPos.y, playerPos.z); // player pos

    // shoot at player
    if (hp.distanceTo(pp) <= bubble + 3 && Math.random() < 0.01) {
      shoot(hominid, hp.subVectors(pp, hp).normalize());
    }
  }

  createHominid() {
    const radius = 0.4;
    const height = 1;
    const torsoMass = 3;
    const headMass = 1;

    /**
    * Torso
    */

    const torso = new Entity();

    const randomPos = () => Math.random() * 150 - 75;

    const torsoBody = Physics.makeCapsule(torsoMass, radius, height);
    torsoBody.allowSleep = false;
    torsoBody.position.set(randomPos(), 30, randomPos());
    torsoBody.fixedRotation = true;
    torsoBody.updateMassProperties();
    torso.setComponent(PhysicsData, torsoBody);

    const torsoMesh = GraphicsUtils.makeCylinder(1, height + radius * 2);
    torsoMesh.scale.set(radius, height + radius * 2, radius);
    torso.setComponent(GraphicsData, torsoMesh);

    torso.setComponent(MovementData, new MovementData(3, 1.5));

    torso.setComponent(HealthData, {
      hp: 5, max: 5,
    });

    /**
     * Head
     */

    const head = new Entity();

    const headBody = Physics.makeBall(headMass, radius + 0.1);
    headBody.linearDamping = 0.9;
    headBody.allowSleep = false;
    headBody.position.copy(torsoBody.position);
    headBody.position.y += height / 2 + radius;
    head.setComponent(PhysicsData, headBody);

    const headMesh = GraphicsUtils.makeBall(radius);
    headMesh.userData.norotate = true;
    head.setComponent(GraphicsData, headMesh);

    /**
     * Neck
     */

    const neck = new ConstraintData(
      headBody,
      new Vec3(0, 0, 0),
      torsoBody,
      new Vec3(0, height + radius * 1.5, 0),
      4,
    );
    neck.collideConnected = false;
    head.setComponent(ConstraintData, neck);

    /**
     * Halo
     */

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
    haloSprite.position.y += radius * 4;
    haloSprite.parent = headMesh;
    halo.setComponent(GraphicsData, haloSprite);

    torso.setComponent(HominidData, {
      bubble: 15,
      torso,
      head,
      halo,
    });

    // headshots deal damage
    headBody.addEventListener('collide', ({ contact }: {contact: ContactEquation}) => {
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
