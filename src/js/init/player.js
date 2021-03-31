"use strict";

import {addObjectToScene, getCamera} from "../graphics"
import {PointerLockControls} from "../threex/pointer-lock-controls";

import {Mesh, BoxGeometry, MeshLambertMaterial} from "three";

import {Sphere, Body, Vec3} from "cannon-es";
import { addEntity } from "../entities";

export default (globals, player) => {
    const mass = 100;
    const radius = 1.7;

    let sphereShape = new Sphere(radius);
    let sphereBody = new Body({
        mass,
        material: globals.groundMaterial
    });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0, 30, 0);
    // sphereBody.linearDamping = 0.9;
    sphereBody.angularDamping = 0.9;

    globals.world.addBody(sphereBody);

    sphereBody.addEventListener('collide', (event) => {
        const contact = event.contact;
        const upAxis = new Vec3(0, 1, 0);

        let contactNormal = new Vec3();

        if (contact.bi.id == sphereBody.id)
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni);

        if (contactNormal.dot(upAxis) > 0.5 && sphereBody.velocity.y <= -60)
            player.hp.val -= Math.floor(Math.abs(sphereBody.velocity.y) / 10);
    });

    let mesh = new Mesh(
        new BoxGeometry(1, 2, 1),
        new MeshLambertMaterial()
    );
    mesh.castShadow = true;
    addObjectToScene(mesh);
    addEntity(sphereBody, sphereShape, mesh, true);

    globals.controls = new PointerLockControls(getCamera(), document.body, sphereBody);
};
