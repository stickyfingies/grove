function Weapon(type, dmg, x, y, z, scale) {
    this.shape = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({}));
    this.damage = dmg
    switch (type) {
        case 'sword':
            this.swordloader = new THREE.ObjectLoader();
            this.swordloader.load('img/models/weapons/sword/sword.json', function(obj) {
                this.shape = obj;
                this.shape.scale.set(scale, scale, scale);
                this.shape.position.set(x, y, z);
                scene.add(this.shape)
            });
            break;
        case 'crossbow':
            this.gunloader = new THREE.ObjectLoader();
            this.gunloader.load('img/models/weapons/crossbow/crossbow.json', function(obj) {
                this.shape = obj;
                this.shape.scale.set(scale, scale, scale);
                this.shape.position.set(x, y, z);
                scene.add(this.shape);
            });
            break;
        default:
            scene.add(this.shape);
    }
}