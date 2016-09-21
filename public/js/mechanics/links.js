var links = {};
links.portal = function Portal(o) {
    var map = new THREE.TextureLoader().load("/img/Portal.png");
    var material = new THREE.SpriteMaterial({
        map: map,
        color: 0xffffff,
        fog: true
    });
    var sprite = new THREE.Sprite(material);
    scene.add(sprite);
    objects.push(sprite);
    sprite.position.set(o.x, o.y, o.z);
    sprite.scale.set(o.s || 5, o.s || 5, o.s || 5);
    sprite.name = 'PORTAL';
    sprite.callback = function () {
        socket.emit('map-update', {
            user: userdata,
            map: o.map
        });
    };
    var glowM = new THREE.SpriteMaterial({
        map: new THREE.ImageUtils.loadTexture('/img/glow.png'),
        useScreenCoordinates: false,
        color: 0x0000ff,
        blending: THREE.AdditiveBlending
    });
    var glow = new THREE.Sprite(glowM);
    glow.scale.set(5, 5, 5);
    sprite.add(glow);
    ps.sphere({
        x: o.x,
        y: o.y,
        z: o.z,
        r: 30
    });
};