"use strict";

require('./items');

let G = module.exports = {};

G.scene = new THREE.Scene();
G.renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
});
G.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);

G.world = new CANNON.World();

G.socket = io();

G.composers = [];

G.BODIES = {
    items: [],
    projectiles: []
};
G.AIS = [];
G.LABELS = [];
G.PLAYERS = [];
G.EMITTERS = [];
G.TWEENS = [];
G.remove = {
    bodies: [],
    meshes: [],
    tweens: []
};

G.listener = new THREE.AudioListener(),

G.delta = Date.now();
G.clock = new THREE.Clock();
G.frustum = new THREE.Frustum();
G.cameraViewProjectionMatrix = new THREE.Matrix4();

G.groundMaterial = new CANNON.Material("groundMaterial");


// module.exports.rendererDEBUG = new THREE.CannonDebugRenderer(module.exports.scene, module.exports.world);
// Adjust constraint equation parameters for ground/ground contact
let ground_ground_cm = new CANNON.ContactMaterial(module.exports.groundMaterial, module.exports.groundMaterial, {
    friction: 50,
    restitution: 0.3,
});

// Add contact material to the world
G.world.addContactMaterial(ground_ground_cm);

let load = require('./load');
G.load = load.load;
G.box = load.box;
G.label = load.label;
G.ball = load.ball;
G.plane = load.plane;