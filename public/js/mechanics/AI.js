function ai(position, hp, speed, karma, loop, path) {
    var o = this.o = {
        hp: hp || 10,
        speed: speed || 1,
        loop: loop || function () {},
        position: position || new THREE.Vector3(0, 0, 0),
        last: 0,
        karma: karma
    };
    $.getJSON('//uinames.com/api/', function (json) {
        o.name = json.name;
    });
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/' + path + '.json', function (obj) {
        obj.scale.set(5, 5, 5);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
            obj.children[key].callback = function () {
                socket.emit('chat message', o.name + ': hi!');
            };
        }
        obj.position.set(position.x || 0, position.y || 10, position.z || 0);
        o.origin = new THREE.Vector3(position.x || 0, position.y || 10, position.z || 0);
        obj.rotation.y = Math.PI / 2;
        o.shape = o.shape || obj;
        scene.add(o.shape);
        setInterval(function () {
            o.loop(o);
        });
    });
    this.o = o;
    ais.push(this.o);
    return this.o;
}

var villager = function (pos) {
    ai(pos, 10, 10, 'good', function (o) {
        if (o.shape.position.distanceTo(player.shape.position) < 50)
            o.shape.lookAt(new THREE.Vector3(player.shape.position.x, o.shape.position.y, player.shape.position.z));
        // var tween = new TWEEN.Tween(o.shape.position)
        //     .to(player.shape.position, 1000)
        //     .onUpdate(function () {
        //         o.shape.lookAt(player.shape.position);
        //     })
        //     .start();

        ////////////////////////////////////////////////////////

        var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 5);
        raycaster.ray.origin.copy(o.shape.position);
        var intersections = raycaster.intersectObjects(objects);
        var isOnObject = intersections.length > 0;
        if (!isOnObject) o.shape.position.y--;
    }, 'villager/villager');
};

var fox = function (pos) {
    ai(pos, 25, 15, 'evil', function (o) {
        var target = null;
        for (var key in ais) {
            if (!target || ais[key].shape.position.distanceTo(o.shape.position) < target.shape.position.distanceTo(o.shape.position) && ais[key].karma != o.karma) target = ais[key];
        }
        if (player.shape.position.distanceTo(o.shape.position) < target.shape.position.distanceTo(o.shape.position)) target = player;
        var tween = new TWEEN.Tween(o.shape.position)
            .to(target.shape.position, 1000)
            .onUpdate(function () {
                o.shape.lookAt(target.shape.position);
            })
            .start();

        ////////////////////////////////////////////////////////

        var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 5);
        raycaster.ray.origin.copy(o.shape.position);
        var intersections = raycaster.intersectObjects(objects);
        var isOnObject = intersections.length > 0;
        if (!isOnObject) o.shape.position.y--;
    }, 'fox/fox');
};