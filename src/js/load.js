/* global CANNON, THREE */

let globals = require('./globals');

function load(mesh, opts) {
    opts = opts ? opts : {};
    mesh.castShadow = true;
    mesh.recieveShadow = true;
    var verts = [],
        faces = [];
    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var v = mesh.geometry.vertices[i];
        verts.push(new CANNON.Vec3(v.x, v.y, v.z));
    }
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        var f = mesh.geometry.faces[i];
        faces.push([f.a, f.b, f.c]);
    }
    var cvph = new CANNON.ConvexPolyhedron(verts, faces);
    var Cbody = new CANNON.Body({
        mass: opts.mass || 0,
        material: opts.material || undefined
    });
    Cbody.addShape(cvph);
    Cbody.position.copy(mesh.position);
    Cbody.quaternion.copy(mesh.quaternion);
    globals.world.add(Cbody);
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

function box(opts) {
    opts = opts ? opts : {};

    var halfExtents = new CANNON.Vec3(opts.l !== undefined ? opts.l : 1, opts.h !== undefined ? opts.h : 1, opts.w !== undefined ? opts.w : 1);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    var boxBody = new CANNON.Body({
        mass: opts.mass || 0
    });
    boxBody.addShape(boxShape);
    var boxMesh = opts.mesh || new THREE.Mesh(boxGeometry, opts.mat !== undefined ? opts.mat : new THREE.MeshPhongMaterial({
        color: 0xFF0000
    }));
    const index = globals.BODIES['items'].push({
        body: boxBody,
        shape: boxShape,
        mesh: boxMesh
    });

    let body = globals.BODIES['items'][index];

    globals.world.add(body.body);
    globals.scene.add(body.mesh);
    body.mesh.castShadow = true;
    body.mesh.receiveShadow = true;
    opts.pos ? body.mesh.position.set(opts.pos.x, opts.pos.y, opts.pos.z) : null;
    body.norotete = opts.norotate || false;

    return body;

}

function ball(opts) {
    opts = opts ? opts : {};
    var ballShape = new CANNON.Sphere(opts.radius || 0.2);
    var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    var ballBody = new CANNON.Body({
        mass: opts.mass !== undefined ? opts.mass : 10
    });

    ballBody.addShape(ballShape);
    var ballMesh = opts.mesh || new THREE.Mesh(ballGeometry, opts.mat || new THREE.MeshPhongMaterial({
        color: opts.c || 0x00CCFF
    }));

    const body = globals.BODIES[opts.array || 'items'].push({
        body: ballBody,
        shape: ballShape,
        mesh: ballMesh,
        norotate: opts.norotate || false
    });

    globals.world.add(body.body);
    globals.scene.add(body.mesh);
    body.mesh.castShadow = true;
    body.mesh.receiveShadow = true;
    
    !opts.cb || opts.cb(body);

    opts.pos ? body.body.position.set(opts.pos.x, opts.pos.y, opts.pos.z) : null;

    return body;
}

function plane(opts) { // PLANE BROKEN!!!!!
    var geometry = new THREE.PlaneGeometry(5, 20, 32);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide
    });
    var plane = new THREE.Mesh(geometry, material);
    globals.scene.add(plane);

    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape
    });
    globals.world.add(groundBody);

    globals.BODIES[opts.array || 'items'].push({
        body: groundBody,
        shape: groundShape,
        mesh: plane
    });

    return {
        body: groundBody,
        shape: groundShape,
        mesh: plane
    };
} // PLANE BROKEN!!!!
// WHOA> I JUST DID SOMEHTHING


function label(mesh, txt = '', icon = 'run') {

    var fontface = "Arial";

    var fontsize = 18;

    var borderThickness = 4;

    var borderColor = {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0
    };

    var backgroundColor = {
        r: 255,
        g: 255,
        b: 255,
        a: 1.0
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(txt);
    var textWidth = metrics.width;

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
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(5, 2.5, 1.0);
    mesh.add(sprite);

}

function roundRect(ctx, x, y, w, h, r) {
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

module.exports.load = load;
module.exports.box = box;
module.exports.label = label;
module.exports.ball = ball;
module.exports.plane = plane;
