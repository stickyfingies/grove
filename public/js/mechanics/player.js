var player = {
    shape: new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({})),
    inventory: [],
    init: function () {
        var _loader = new THREE.ObjectLoader();
        _loader.load('/img/villager/villager.json', function (obj) {
            player.shape = obj;
            player.shape.scale.set(5, 5, 5);
            for (var key in player.shape.children) {
                objects.push(player.shape.children[key]);
            }
            scene.add(player.shape);
            player.shape.position.set(0, 50, 0);
        });
    }
};