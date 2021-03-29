"use strict";

require('./items');

module.exports = {
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: true
    }),
    camera: new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000),

    world: new CANNON.World(),

    socket: io(),
    
    composers: [],

    BODIES: {
        items: [],
        projectiles: []
    },
    AIS: [],
    LABELS: [],
    PLAYERS: [],
    EMITTERS: [],
    TWEENS: [],
    remove: {
        bodies: [],
        meshes: [],
        tweens: []
    },
    
    listener: new THREE.AudioListener(),

    delta: Date.now(),
    clock: new THREE.Clock(),
    frustum: new THREE.Frustum(),
    cameraViewProjectionMatrix: new THREE.Matrix4(),

    groundMaterial: new CANNON.Material("groundMaterial")
};


// module.exports.rendererDEBUG = new THREE.CannonDebugRenderer(module.exports.scene, module.exports.world);
// Adjust constraint equation parameters for ground/ground contact
let ground_ground_cm = new CANNON.ContactMaterial(module.exports.groundMaterial, module.exports.groundMaterial, {
    friction: 50,
    restitution: 0.3,
});

// Add contact material to the world
module.exports.world.addContactMaterial(ground_ground_cm);

let load = require('./load');
module.exports.load = load.load;
module.exports.box = load.box;
module.exports.label = load.label;
module.exports.ball = load.ball;
module.exports.plane = load.plane;