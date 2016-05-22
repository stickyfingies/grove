function weapon(o) {
    this.name = o.name;
    this.damage = o.dmg;
    this.weaponGeo = new THREE.BoxGeometry(1, 2, 1);
    this.weaponMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.FrontSide
    });
    this.weapon = new THREE.Mesh(this.weaponGeo, this.weaponMat);
    this.mtlLoader = new THREE.MTLLoader();
    this.mtlLoader.setBaseUrl('img/models/');
    this.mtlLoader.setPath('img/models/');
    this.mtlLoader.load(o.path + '.mtl', 'lambert', function (materials) {

        materials.preload();

        this.objLoader = new THREE.OBJLoader();
        this.objLoader.setMaterials(materials);
        this.objLoader.setPath('images/3d/');
        this.objLoader.load(o.path + '.obj', function (object) {
            this.weapon = object;
            this.weapon.position.set(o.x || 0, o.y || 0, o.z || 0);
            this.weapon.scale.set(o.scale || 1, o.scale || 1, o.scale || 1);
            scene.add(this.weapon);
            objects.push(this.weapon);
        });
    });
}