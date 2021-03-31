"use strict";

import {World, Material, ContactMaterial} from "cannon-es";

let G = {
    world: new World(),
    socket: io(),
    LABELS: [],
    TWEENS: [],
    remove: {
        bodies: [],
        meshes: [],
        tweens: []
    },
    delta: Date.now(),
    controls: {
        enabled: false,
        update(dt) {}
    },
    groundMaterial: new Material("groundMaterial")
};

// Adjust constraint equation parameters for ground/ground contact
let ground_ground_cm = new ContactMaterial(G.groundMaterial, G.groundMaterial, {
    friction: 50,
    restitution: 0.3,
});

// Add contact material to the world
G.world.addContactMaterial(ground_ground_cm);

export default G;