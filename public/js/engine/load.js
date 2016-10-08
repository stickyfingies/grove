function load(mesh, opts) {
    opts = opts ? opts : {};
    mesh.castShadow = true;
    mesh.recieveShadow = true;
    var verts = [],
        faces = [];
    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var v = mesh.geometry.vertices[i];
        verts.push(new CANNON.Vec3(v.x, v.y, v.z))
    }
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        var f = mesh.geometry.faces[i];
        faces.push([f.a, f.b, f.c])
    }
    var cvph = new CANNON.ConvexPolyhedron(verts, faces);
    var Cbody = new CANNON.Body({
        mass: opts.mass || 0
    });
    Cbody.addShape(cvph);
    Cbody.position.copy(mesh.position);
    Cbody.quaternion.copy(mesh.quaternion);
    world.add(Cbody);
    BODIES['items'].push({
        body: Cbody,
        shape: cvph,
        mesh: mesh
    });
    return {
        body: Cbody,
        shape: cvph,
        mesh: mesh
    }
}

function box(opts) {
    opts = opts ? opts : {};

    var halfExtents = new CANNON.Vec3(opts.l || 1, opts.h || 1, opts.w || 1);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    var boxBody = new CANNON.Body({
        mass: opts.mass || 0
    });
    boxBody.addShape(boxShape);
    var boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshLambertMaterial({
        color: 0xFF0000
    }));
    world.add(boxBody);
    scene.add(boxMesh);
    boxBody.position.set(opts.x || 0, opts.y || 10, opts.z || 0);
    boxMesh.position.set(opts.x || 0, opts.y || 10, opts.z || 0);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    BODIES['items'].push({
        body: boxBody,
        shape: boxShape,
        mesh: boxMesh
    });

    return {
        body: boxBody,
        shape: boxShape,
        mesh: boxMesh
    }
}

function label(mesh, txt) {
    var element = document.createElement('h2')
    document.body.appendChild(element)
    element.style.color = 'white'
    element.style.position = 'absolute'
    element.innerHTML = txt || 'BLAH BLAH BLAH';
    LABELS.push(function () {
        var position = THREEx.ObjCoord.cssPosition(mesh, camera, renderer)
        var boundingRect = element.getBoundingClientRect()
        element.style.left = (position.x - boundingRect.width / 2) + 'px';
        element.style.top = (position.y - boundingRect.height / 2 - 70) + 'px';
        if (frustum.intersectsObject(mesh)) element.style.opacity = 1;
        else element.style.opacity = 0;
    });
}