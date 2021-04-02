"use strict";

import { Object3D } from "three";

import { Sphere, Body, Vec3, Material } from "cannon-es";
import { addEntity } from "../entities";

export default (globals: any, player: any) => {
    const mass = 1;
    const radius = 1.7;

    let shape = new Sphere(radius);
    let material = new Material("playerMaterial");
    let body = new Body({
        mass,
        material
    });
    body.addShape(shape);
    body.position.set(0, 30, 0);
    body.fixedRotation = true;
    // body.linearDamping = 0.9;

    globals.world.addBody(body);

    body.addEventListener("collide", ({ contact }: any) => {
        const upAxis = new Vec3(0, 1, 0);
        let contactNormal = new Vec3();

        if (contact.bi.id == body.id)
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni);

        if (contactNormal.dot(upAxis) > 0.5 && body.velocity.y <= -60)
            player.hp.val -= Math.floor(Math.abs(body.velocity.y) / 10);
    });

    addEntity(body, shape, new Object3D(), true);
};
