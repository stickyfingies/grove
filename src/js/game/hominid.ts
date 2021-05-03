import { Vec3 } from 'cannon-es';
import {
  Color, SpriteMaterial, Sprite, CanvasTexture, Vector3,
} from 'three';
import { Entity } from '../entities';
import { MeshData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { ConstraintData, Physics, PhysicsData } from '../physics';
import { HealthData } from './health';
import GameScript from '../script';
import { shoot } from './shooting';
import ScoreData from './score';

class HominidData {
  // walking speed
  speed: number;

  // personal space bubble around the player at which hominids will stop approaching
  bubble: number;
}

export default class HominidScript extends GameScript {
  queries = new Set([HominidData, HealthData]);

  init() {
    this.gui.add(this, 'createHominid').name('Spawn Hominid');

    const spawn = () => {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) this.createHominid();
    };

    spawn();

    setInterval(() => spawn(), 12000);
  }

  // eslint-disable-next-line class-methods-use-this
  update(dt: number, hominid: Entity) {
    const player = Entity.getTag('player');
    const { speed, bubble } = hominid.getComponent(HominidData);

    const playerPhysics = player.getComponent(PhysicsData);
    const hominidPhysics = hominid.getComponent(PhysicsData);

    const playerPos = playerPhysics.interpolatedPosition;
    const hominidPos = hominidPhysics.interpolatedPosition;

    // crude movement - follow player
    if (hominidPos.x < playerPos.x - bubble) hominidPhysics.velocity.x = speed;
    else if (hominidPos.x > playerPos.x + bubble) hominidPhysics.velocity.x = -speed;
    if (hominidPos.z < playerPos.z - bubble) hominidPhysics.velocity.z = speed;
    else if (hominidPos.z > playerPos.z + bubble) hominidPhysics.velocity.z = -speed;

    const hp = new Vector3(hominidPos.x, hominidPos.y, hominidPos.z); // hominid pos
    const pp = new Vector3(playerPos.x, playerPos.y, playerPos.z); // player pos

    if (hp.distanceTo(pp) <= bubble && Math.random() < 0.01) {
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
    torso.setComponent(MeshData, torsoMesh);

    torso.setComponent(HealthData, {
      hp: { value: 5, max: 5 },
    });

    torso.setComponent(HominidData, {
      speed: 4,
      bubble: 15,
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
    head.setComponent(MeshData, headMesh);

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
      ctx.fillText(`${health.hp.value}/${health.hp.max}`, 128, 128);
      return new CanvasTexture(canvas);
    };

    const haloSprite = new Sprite();
    haloSprite.material = new SpriteMaterial({ map: drawHaloTexture(), color: 0x55ff55 });
    haloSprite.scale.set(2, 2, 2);
    haloSprite.position.y += radius * 4;
    haloSprite.parent = headMesh;
    halo.setComponent(MeshData, haloSprite);

    /**
     * Events
     */

    this.eManager.events.on(`delete${HealthData.name}Component`, (id: number) => {
      if (id !== torso.id) return;

      // increment player score
      const player = Entity.getTag('player');
      const playerScore = player.getComponent(ScoreData);
      playerScore.score += 1;

      // change body part physics properties
      torsoBody.angularDamping = 0.8;
      torsoBody.fixedRotation = false;
      torsoBody.updateMassProperties();
      torsoBody.allowSleep = true;
      headBody.allowSleep = true;

      // change body part graphics properties
      torsoMesh.material.color = new Color(0x222222);
      this.graphics.updateMaterial(torsoMesh);
      headMesh.material.color = new Color(0x222222);
      this.graphics.updateMaterial(headMesh);

      // decapitate >:)
      setTimeout(() => head.deleteComponent(ConstraintData), 50);
      halo.delete();

      // delete corpse after 10 seconds
      setTimeout(() => {
        head.delete();
        torso.delete();
      }, 10000);
    });

    // headshots deal damage
    headBody.addEventListener('collide', (event: any) => {
      const health = torso.getComponent(HealthData);
      const impact = event.contact.getImpactVelocityAlongNormal();

      if (Math.abs(impact) >= 15 && torso.hasComponent(HealthData)) {
        health.hp.value -= Math.floor(Math.abs(impact) / 10);
        haloSprite.material.map = drawHaloTexture();
        haloSprite.material.opacity = health.hp.value / health.hp.max;
        this.graphics.updateMaterial(haloSprite);
      }
    });
  }
}
