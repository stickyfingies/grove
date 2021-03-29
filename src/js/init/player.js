"use strict";

import PointerLockControls from "../threex/PointerLockControls";

export default (globals, player) => {

    var mass = 100,
        radius = 1.7;
    var sphereShape = new CANNON.Sphere(radius);
    var sphereBody = new CANNON.Body({
        mass: mass,
        material: globals.groundMaterial
    });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0, 30, 0);
    // sphereBody.linearDamping = 0.9;
    sphereBody.angularDamping = 0.9;
    globals.world.add(sphereBody);
    sphereBody.addEventListener('collide', (event) => {

        const contact = event.contact;
        const upAxis = new CANNON.Vec3(0, 1, 0);
        let contactNormal = new CANNON.Vec3();
        if (contact.bi.id == sphereBody.id)
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is
        if (contactNormal.dot(upAxis) > 0.5 && sphereBody.velocity.y <= -60)
            player.hp.val += Math.floor(sphereBody.velocity.y / 10);
    });
    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshLambertMaterial()
    );
    mesh.castShadow = true;
    globals.scene.add(mesh);
    globals.BODIES['player'] = {
        body: sphereBody, // HI!!!!!!!!!!!!!!!!!!!!
        shape: sphereShape, // HYARHYARHYARHYARHYAR
        mesh: mesh // HNORKHNORKHNORKHNORKHNORKHNORK
    };

    globals.controls = new PointerLockControls(globals.camera, globals.BODIES['player'].body);
    globals.scene.add(globals.controls.getObject());

    window.controls = globals.controls;

};
