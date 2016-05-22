function AI(p1, p2) {
    this.p = [p1, p2];
    this.dest = this.p[1];
    this.g = new THREE.BoxGeometry(5, 15, 5);
    this.m = new THREE.MeshLambertMaterial({
        color: 0x00ff00
    });
    this.shape = new THREE.Mesh(this.g, this.m);
    this.shape.position.set(this.p[0][0], this.p[0][1], this.p[0][2]);
    scene.add(this.shape);
    objects.push(this.shape);
    var self = this;
    this.update = function () {
        var p = this.shape.position,
            dest = this.dest;
        if (p.distanceTo(cube.position) > 50) this.shape.lookAt(new THREE.Vector3(dest[0], dest[1], dest[2]));
        else this.shape.lookAt(new THREE.Vector3(cube.position.x, 7.5, cube.position.z));
        if (p.distanceTo(cube.position) > 50) this.shape.translateZ(0.5);
        if (p.x == dest[0] && p.z == dest[2]) {
            if (this.dest == this.p[1]) this.dest = this.p[0];
            else if (this.dest == this.p[0]) this.dest = this.p[1];
        }
    };
    ais.push(this);
}

function Enemy(p1, p2) {
    this.p = [p1, p2];
    this.dest = this.p[1];
    this.g = new THREE.BoxGeometry(5, 15, 5);
    this.m = new THREE.MeshLambertMaterial({
        color: 0xff0000
    });
    this.shape = new THREE.Mesh(this.g, this.m);
    this.shape.position.set(this.p[0][0], this.p[0][1], this.p[0][2]);
    var self = this;
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl('img/models/');
    mtlLoader.setPath('img/models/');
    mtlLoader.load('Zombie.mtl', 'lambert', function (materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('img/models/');
        objLoader.load('Zombie.obj', function (object) {
            self.shape = object;
            self.shape.scale.set(0.4, 0.4, 0.4);
            self.shape.position.set(self.p[0][0], self.p[0][1], self.p[0][2]);
            scene.add(self.shape);
            for(var key in self.shape.children) {
                objects.push(self.shape.children[key]);
            }
        });

    });
    var self = this;
    this.update = function () {
        var p = this.shape.position,
            dest = this.dest;
        var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 3);
        raycaster.ray.origin.copy(this.shape.position);
        var intersections = raycaster.intersectObjects(objects);
        var isOnObject = intersections.length > 0;
        if (!isOnObject) this.shape.translateY(-1.5);
        if (p.distanceTo(cube.position) > 100) this.shape.lookAt(new THREE.Vector3(dest[0], p.y, dest[2]));
        else this.shape.lookAt(new THREE.Vector3(cube.position.x, p.y, cube.position.z));
        this.shape.translateZ(0.5);
        if (p.x == dest[0] && p.z == dest[2]) {
            if (this.dest == this.p[1]) this.dest = this.p[0];
            else if (this.dest == this.p[0]) this.dest = this.p[1];
        }
    };
    ais.push(this);
}