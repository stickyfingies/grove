import {
  Body, Sphere, Material, Vec3,
} from 'cannon-es';
import { Object3D } from 'three';
import { addEntity } from './entities';
import { world } from './physics';

class Player {
    hp: { val: number, max: number };

    mp: { val: number, max: number };

    xp: { level: number, xp: number, max: number };

    equipped: any;

    inventory: any;

    hotbar: any;

    constructor() {
      this.hp = {
        val: 10, // current hp
        max: 10, // max hp.  No min, cuz if it reaches 0, ur dead.  fun thoughts
      };
      this.mp = {
        val: 5, // see hp
        max: 5,
      };
      this.xp = {
        level: 0, // level
        xp: 3, // current xp
        max: 10, // xp needed till lvl up
      };
      this.equipped = {
        weapon: null,
      };
      this.inventory = [];
      this.hotbar = {
        list: [],
        selected: 1,
        active: null,
      };

      const mass = 1;
      const radius = 1.7;

      const shape = new Sphere(radius);
      const material = new Material('playerMaterial');
      const body = new Body({
        mass,
        material,
      });
      body.addShape(shape);
      body.position.set(0, 30, 0);
      body.fixedRotation = true;
      // body.linearDamping = 0.9;

      world.addBody(body);

      body.addEventListener('collide', ({ contact }: any) => {
        const upAxis = new Vec3(0, 1, 0);
        const contactNormal = new Vec3();

        if (contact.bi.id === body.id) {
          contact.ni.negate(contactNormal);
        } else {
          contactNormal.copy(contact.ni);
        }

        if (contactNormal.dot(upAxis) > 0.5 && body.velocity.y <= -20) {
          this.hp.val -= Math.floor(Math.abs(body.velocity.y) / 10);
          console.log(this.hp.val);
        }
      });

      addEntity(body, shape, new Object3D(), true);
    }
}

export default Player;
