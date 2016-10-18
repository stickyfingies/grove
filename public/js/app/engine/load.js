/* global CANNON, THREE, THREEx */

define(['globals'], function (globals) {
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
            mass: opts.mass || 0
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
        globals.world.add(boxBody);
        globals.scene.add(boxMesh);
        boxBody.position.set(opts.x || 0, opts.y || 10, opts.z || 0);
        boxMesh.position.set(opts.x || 0, opts.y || 10, opts.z || 0);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        globals.BODIES['items'].push({
            body: boxBody,
            shape: boxShape,
            mesh: boxMesh
        });

        return {
            body: boxBody,
            shape: boxShape,
            mesh: boxMesh
        };
    }

    function ball(opts) {
        opts = opts ? opts : {};
        var ballShape = new CANNON.Sphere(opts.radius || 0.2);
        var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
        var ballBody = new CANNON.Body({
            mass: 100
        });

        ballBody.addShape(ballShape);
        var ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({
            color: Math.random() * 0xFFFFFF
        }));
        globals.world.add(ballBody);
        globals.scene.add(ballMesh);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;
        globals.BODIES[opts.array || 'items'].push({
            body: ballBody,
            shape: ballShape,
            mesh: ballMesh
        });

        return {
            body: ballBody,
            shape: ballShape,
            mesh: ballMesh
        };
    }

    function label(mesh, txt) {
        var element = document.createElement('h2');
        document.body.appendChild(element);
        element.style.color = 'white';
        element.style.position = 'absolute';
        element.innerHTML = txt || 'BLAH BLAH BLAH';
        globals.LABELS.push(function () {
            var position = THREEx.ObjCoord.cssPosition(mesh, globals.camera, globals.renderer);
            var boundingRect = element.getBoundingClientRect();
            element.style.left = (position.x - boundingRect.width / 2) + 'px';
            element.style.top = (position.y - boundingRect.height / 2 - 70) + 'px';
            if (globals.frustum.intersectsObject(mesh)) element.style.opacity = 1;
            else element.style.opacity = 0;
        });
    }

    globals.load = load;
    globals.box = box;
    globals.label = label;
    globals.ball = ball;

    return {
        loaded: true
    };

});