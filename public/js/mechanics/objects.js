var obj = [];
obj.torch = function Torch(o) {
    switch (o.type) {
    case 'floating':
        o.path = 'Blood-Lamp';
        o.material = 'basic';
        obj.import(o);
        var light = new THREE.PointLight(o.color || 0xFFFFFF, 2, 100, 2);
        light.position.set(o.x, o.y, o.z);
        scene.add(light);
        var light = new THREE.SpotLight(o.color || 0xFFFFFF, 0.5);
        light.position.set(o.x, o.y, o.z);
        scene.add(light);
        var t = new THREE.Object3D();
        t.position.set(o.x, o.y, o.z);
        scene.add(t);
        light.target = t;
        break;
    default:
        var _loader = new THREE.ObjectLoader();
        _loader.load('/img/torch/rubie.json', function (obj) {
            scene.add(obj);
            obj.scale.set(2, 2, 2);
            for (var key in obj.children) {
                objects.push(obj.children[key]);
            }
            obj.position.set(o.x, o.y, o.z);
        });
        break;
    }
};

obj.sign = function (o) {
    var geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    var material = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader().load("/img/sign.png"),
        transparent: true,
        side: THREE.DoubleSide
    });
    var plane = new THREE.Mesh(geometry, material);
    var material = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("/img/speech-bubble.png"),
        transparent: true,
        side: THREE.DoubleSide,
        wrapAround: true
    });
    var bubble = new THREE.Sprite(material);
    bubble.scale.set(5, 5, 5);
    bubble.position.y = o.y + 7.5;
    plane.add(bubble);
    objects.push(plane);
    plane.name = o.txt || '~+~+~+~+~';
    plane.callback = function () {
        alert(plane.name);
    };
    plane.position.set(o.x, o.y + 5, o.z);
};

obj.house = function House(o) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/house/house.json', function (obj) {
        scene.add(obj);
        obj.scale.set(25, 25, 25);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        obj.position.set(o.x, o.y, o.z);
        obj.translateX(50);
    });
    var __loader = new THREE.ObjectLoader();
    __loader.load('/img/basket/basket.json', function (obj) {
        scene.add(obj);
        objects.push(obj);
        obj.scale.set(5, 5, 5);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        obj.position.y += 2;
        obj.translateX(25);
    });
};
obj.house1 = function (o) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/basic-house-1/house-1.json', function (obj) {
        scene.add(obj);
        obj.scale.set(o.scale || 15, o.scale || 20, o.scale || 15);
        obj.traverse(function (child) {
            objects.push(child);
            child.callback = function () {
                if (child.name == 'Door' || child.name == 'Door.001') {
                    socket.emit('map-update', {
                        user: userdata,
                        map: 'house1'
                    });
                }
            };
            child.castShadow = true;
            child.receiveShadow = true;
        });
        obj.position.set(o.x, o.y, o.z);
        obj.rotation.y = Math.PI / 2;
        o.y += 60;
        o.z -= 3;
        o.x += 3;
        ps.smoke(o);
        obj.castShadow = true;
    });
};

obj.island = function Island(o) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/island/floating-island.json', function (obj) {
        scene.add(obj);
        obj.scale.set(o.scale || 20, o.scale || 20, o.scale || 20);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        obj.position.set(o.x, o.y - 10, o.z);
    });
};

obj.floatingHouse = function floatingHouse(o) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/island/floating-island.json', function (obj) {
        scene.add(obj);
        obj.scale.set(100, 75, 100);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        obj.position.y -= 77.5;
    });
    obj.house(o);
    setTimeout(function () {
        o.y += 4.5;
        o.x += 50;
        obj.torch(o);
    }, 3000);
};

obj.tree = function Tree(o) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/tree/tree.json', function (obj) {
        scene.add(obj);
        obj.scale.set(10, 10, 10);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        obj.position.set(o.x, o.y, o.z);
    });
};

obj.spawnAltarStone = function Stone_Spawn_Altar(o) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/spawn-alter-stone/spawn-altar-stone.json', function (obj) {
        scene.add(obj);
        obj.scale.set(25, 25, 25);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        obj.position.set(o.x, o.y, o.z);
        o.r = 50;
        o.c = [new THREE.Color('white')];
        ps.sphere(o);
    });
};

obj.grave = function Grave(o) {
    var geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    var material = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader().load("/img/grave.png"),
        transparent: true,
        side: THREE.DoubleSide
    });
    var plane = new THREE.Mesh(geometry, material);
    objects.push(plane);
    plane.name = o.txt || '~+~+~+~+~';
    plane.callback = function () {
        alert(plane.name);
    };
    plane.position.set(o.x, o.y + 5, o.z);
};

//

obj.cube = function Cube(o) {
    if (o.map) {
        var map = THREE.ImageUtils.loadTexture(o.map);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(o.rl || 4, o.rw || 4);
    }
    var geometry = new THREE.BoxGeometry(o.w, o.h, o.l);
    var material = new THREE.MeshLambertMaterial({
        color: o.c || 0xffffff,
        map: (map) ? map : null,
        side: THREE.DoubleSide,
        wrapAround: true
    });
    var cube = new THREE.Mesh(geometry, material);
    for (var i = 0; i < cube.geometry.vertices.length; i++)
        cube.geometry.vertices[i].y += Math.sin(cube.geometry.vertices[i].z * 10) * 100
    cube.position.set(o.x, o.y, o.z);
    cube.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    objects.push(cube);
    cube.receiveShadow = true;
};
obj.plane = function plane(o) {
    var geometry = new THREE.PlaneGeometry(o.w, o.l, 100, 100);
    geometry.rotateX(-Math.PI / 2);
    var material = new THREE.MeshLambertMaterial({
        color: o.c || null,
        side: THREE.DoubleSide,
        map: (o.map) ? THREE.ImageUtils.loadTexture(o.map) : null
    });
    var plane = new THREE.Mesh(geometry, material);
    objects.push(plane);
    plane.name = o.name || '';
    plane.position.set(o.x, o.y, o.z);
};
obj.cylinder = function Cylinder(o) {
    var geometry = new THREE.CylinderGeometry(o.rT, o.rB, o.h, 100, 100, o.o);
    var material = new THREE.MeshLambertMaterial({
        color: o.c || 0xffff00,
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load("/img/grass.png")
    });
    var cylinder = new THREE.Mesh(geometry, material);
    objects.push(cylinder);
    cylinder.castShadow = true;
    cylinder.recieveShadow = true;
    cylinder.name = o.name || '';
    cylinder.position.set(o.x, o.y, o.z);
    if (o.r) cylinder.rotation.set(o.r[0], o.r[1], o.r[2]);
};
obj.circle = function Circle(o) {
    var geometry = new THREE.CircleGeometry(o.r || 5, o.s || 32);
    var material = new THREE.MeshLambertMaterial({
        color: o.c || 0xffff00,
        side: THREE.DoubleSide
    });
    var circle = new THREE.Mesh(geometry, material);
    objects.push(circle);
    circle.name = o.name || '';
    if (o.horizontal) circle.rotateX(Math.PI / 2);
    circle.position.set(o.x, o.y, o.z);
};
obj.cone = function Cone(o) {
    var geometry = new THREE.CylinderGeometry(1, o.r, o.h, 64, 64, o.o);
    var material = new THREE.MeshLambertMaterial({
        color: o.c || 0xffff00,
        side: THREE.DoubleSide
    });
    var cylinder = new THREE.Mesh(geometry, material);
    objects.push(cylinder);
    cylinder.name = o.name || '';
    cylinder.position.set(o.x, o.y, o.z);
    cylinder.castShadow = true;
    cylinder.recieveShadow = true;
};

obj.import = function (o, scale) {
    var t = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
        color: 0x000000
    }));
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl('img/models/');
    mtlLoader.setPath('img/models/');
    mtlLoader.load(o.path + '.mtl', o.material || 'lambert', function (materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('img/models/');
        objLoader.load(o.path + '.obj', function (object) {
            t = object;
            t.position.z = o.z || 0;
            t.position.x = o.x || 0;
            t.position.y = o.y || 0;
            for (var key in object.children) {
                objects.push(object.children[key]);
                object.children[key].castShadow = true;
                object.children[key].recieveShadow = true;
                // if (o.scale) object.children[key].scale.set(o.scale[0], o.scale[1], o.scale[2]);
            }
            scene.add(t);
            t.castShadow = true;
            t.recieveShadow = true;
            if (typeof scale == 'object') t.scale.set(scale[0], scale[1], scale[2]);
            else t.scale.set(4, 4, 4);
        });

    });
};