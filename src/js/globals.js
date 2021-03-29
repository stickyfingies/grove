"use strict";

import {Scene, WebGLRenderer, PerspectiveCamera, AudioListener, Clock, Frustum, Matrix4} from "three";

import {World, Material, ContactMaterial} from "cannon-es";

let G = {};

G.scene = new Scene();
G.renderer = new WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
});
G.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);

G.world = new World();

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

G.listener = new AudioListener(),

G.delta = Date.now();
G.clock = new Clock();
G.frustum = new Frustum();
G.cameraViewProjectionMatrix = new Matrix4();

G.groundMaterial = new Material("groundMaterial");


// Adjust constraint equation parameters for ground/ground contact
let ground_ground_cm = new ContactMaterial(G.groundMaterial, G.groundMaterial, {
    friction: 50,
    restitution: 0.3,
});

// Add contact material to the world
G.world.addContactMaterial(ground_ground_cm);

export default G;