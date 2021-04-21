import { Vec3 } from 'cannon-es';
import { Color, TextureLoader, SpriteMaterial } from 'three';
import { eManager, Entity } from '../entities';
import { MeshData, SpriteData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import Engine from '../engine';
import { ConstraintData, Physics, PhysicsData } from '../physics';
import { HealthData } from './health';

let engine: Engine;

const createHominid = () => {
  const radius = 0.4;
  const height = 1;
  const torsoMass = 3;
  const headMass = 1;

  // create body

  const torso = new Entity();

  const randomPos = () => Math.random() * 150 - 75;

  const torsoBody = Physics.makeCapsule(torsoMass, radius, height);
  torsoBody.allowSleep = false;
  torsoBody.position.set(randomPos(), 30, randomPos());
  torsoBody.fixedRotation = true;
  torsoBody.updateMassProperties();
  torso.setComponent(PhysicsData, torsoBody);

  const torsoMesh = GraphicsUtils.makeCylinder(radius, height + radius * 2);
  torso.setComponent(MeshData, torsoMesh);

  // create head

  const head = new Entity();

  const headBody = Physics.makeBall(headMass, radius + 0.1);
  headBody.linearDamping = 0.9;
  headBody.allowSleep = false;
  headBody.position.copy(torsoBody.position);
  headBody.position.y += height / 2 + radius;
  head.setComponent(PhysicsData, headBody);

  const headMesh = GraphicsUtils.makeBall(radius);
  head.setComponent(MeshData, headMesh);

  const health: HealthData = {
    hp: { value: 5, max: 5 },
  };
  head.setComponent(HealthData, health);

  (async () => {
    const map = await new TextureLoader().loadAsync('/img/glow.png');
    const sprite = new SpriteData(new SpriteMaterial({ map, alphaMap: map }));
    sprite.scale.set(2, 2, 2);
    head.setComponent(SpriteData, sprite);
  })();

  // create neck constraint

  const neck = new ConstraintData(
    headBody,
    new Vec3(0, 0, 0),
    torsoBody,
    new Vec3(0, height + radius * 1.5, 0),
    4,
  );
  // @ts-ignore
  head.setComponent(ConstraintData, neck);

  // decapitate on death

  eManager.events.on(`delete${HealthData.name}Component`, (id: number) => {
    if (id !== head.id) return;

    torsoBody.fixedRotation = false;
    torsoBody.angularDamping = 0.8;
    torsoBody.updateMassProperties();
    torsoBody.allowSleep = true;
    headBody.allowSleep = true;

    torsoMesh.material.color = new Color(0x222222);
    engine.graphics.updateMaterial(torsoMesh);
    headMesh.material.color = new Color(0x222222);
    engine.graphics.updateMaterial(headMesh);

    // @ts-ignore
    setTimeout(() => head.deleteComponent(ConstraintData), 50);

    // delete corpse after 10 seconds
    setTimeout(() => {
      head.delete();
      torso.delete();
    }, 10000);
  });

  // headshots deal damage

  headBody.addEventListener('collide', (event: any) => {
    if (event.body.velocity.length() >= 15) {
      health.hp.value -= Math.floor(Math.abs(event.body.velocity.length()) / 10);
    }
  });
};

// eslint-disable-next-line import/prefer-default-export
export const init = (e: Engine) => {
  engine = e;
  engine.gui.add({ createHominid }, 'createHominid').name('Spawn Hominid');

  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
  createHominid();
};
