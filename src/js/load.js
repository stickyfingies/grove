"use strict";

import {ObjectLoader, BoxGeometry, SphereGeometry, Mesh, MeshPhongMaterial, Texture, SpriteMaterial, Sprite} from "three";
import {Vec3, Body, Sphere, Box, ConvexPolyhedron, Trimesh} from "cannon-es";

///

let models = {};
let accessCount = {};
let callbacks = {};

export const loadModel = (uri, callback) => {
    accessCount[uri] = accessCount[uri] || 0;
    ++accessCount[uri];

    callbacks[uri] = callbacks[uri] || [];
    callbacks[uri].push(callback);

    // if this is the first time this resource was requested, load it
    if (accessCount[uri] === 1)
    {
        let loader = new ObjectLoader();
        loader.load(uri, object => {
            models[uri] = object;

            // model may have been requested again since it started loading,
            // serve asset to all cached requests
            for (let cb of callbacks[uri]) {
                cb(models[uri].clone());
            }
        });
    }

    // the model is cached
    if (models[uri]) {
        callback(models[uri].clone());
    }
};

export const load = (mesh, opts, globals) => {
    opts = opts ? opts : {};
    mesh.castShadow = true;
    mesh.recieveShadow = true;

    let verts = [];
    let faces = [];

    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var v = mesh.geometry.vertices[i];
        verts.push(v.x);
        verts.push(v.y);
        verts.push(v.z);
    }
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        var f = mesh.geometry.faces[i];
        faces.push(f.a);
        faces.push(f.b);
        faces.push(f.c);
    }

    var cvph = new Trimesh(verts, faces);
    var Cbody = new Body({
        mass: opts.mass || 0,
        material: opts.material || undefined
    });
    Cbody.addShape(cvph);
    Cbody.position.copy(mesh.position);
    Cbody.quaternion.copy(mesh.quaternion);
    globals.world.addBody(Cbody);
    globals.BODIES['items'].push({
        body: Cbody,
        shape: cvph,
        mesh: mesh
    });
    return {
        body: Cbody,
        shape: cvph,
        mesh: mesh
    };
}

export const box = (opts, globals) => {
    opts = opts ? opts : {};

    let halfExtents = new Vec3(opts.l || 1, opts.h || 1, opts.w || 1);
    let boxShape = new Box(halfExtents);
    let boxGeometry = new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let boxBody = new Body({
        mass: opts.mass || 0
    });
    boxBody.addShape(boxShape);
    let boxMesh = opts.mesh || new Mesh(boxGeometry, opts.mat || new MeshPhongMaterial({
        color: 0xFF0000
    }));
    const index = globals.BODIES['items'].push({
        body: boxBody,
        shape: boxShape,
        mesh: boxMesh
    });

    let body = globals.BODIES['items'][index];

    globals.world.addBody(body.body);
    globals.scene.add(body.mesh);
    body.mesh.castShadow = true;
    body.mesh.receiveShadow = true;
    opts.pos ? body.mesh.position.set(opts.pos.x, opts.pos.y, opts.pos.z) : null;
    body.norotete = opts.norotate || false;

    return body;

}

export const ball = (opts, globals) => {
    opts = opts ? opts : {};
    let ballShape = new Sphere(opts.radius || 0.2);
    let ballGeometry = new SphereGeometry(ballShape.radius, 32, 32);
    let ballBody = new Body({
        mass: opts.mass || 10
    });

    ballBody.addShape(ballShape);
    let ballMesh = opts.mesh || new Mesh(ballGeometry, opts.mat || new MeshPhongMaterial({
        color: opts.c || 0x00CCFF
    }));

    const body = globals.BODIES[opts.array || 'items'].push({
        body: ballBody,
        shape: ballShape,
        mesh: ballMesh,
        norotate: opts.norotate || false
    });

    globals.world.addBody(body.body);
    globals.scene.add(body.mesh);
    body.mesh.castShadow = true;
    body.mesh.receiveShadow = true;
    
    !opts.cb || opts.cb(body);

    opts.pos ? body.body.position.set(opts.pos.x, opts.pos.y, opts.pos.z) : null;

    return body;
}

export const label = (mesh, txt = '', icon = 'run') => {
    const fontface = "Arial";
    const fontsize = 18;
    const borderThickness = 4;
    const borderColor = {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0
    };
    const backgroundColor = {
        r: 255,
        g: 255,
        b: 255,
        a: 1.0
    };

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    let metrics = context.measureText(txt);
    let textWidth = metrics.width;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," +
        backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," +
        borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText(txt, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    let texture = new Texture(canvas);
    texture.needsUpdate = true;

    let spriteMaterial = new SpriteMaterial({
        map: texture,
        useScreenCoordinates: false
    });
    let sprite = new Sprite(spriteMaterial);
    sprite.scale.set(5, 2.5, 1.0);
    mesh.add(sprite);
}

const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}