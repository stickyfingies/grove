'use strict';
let ps = {};
let particles = [];
ps.sphere = function (o) {
    let particleGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('/img/glow.png')
        }
    });

    let emitter = new SPE.Emitter({
        // type: i,
        maxAge: {
            value: 2
        },
        position: {
            value: new THREE.Vector3(o.x, o.y, o.z),
            radius: 50,
            spread: new THREE.Vector3(o.r, o.r, o.r)
        },

        velocity: {
            value: new THREE.Vector3(3, 3, 3),
            distribution: SPE.distributions.SPHERE
        },

        color: {
            value: o.c || [new THREE.Color('white'), new THREE.Color('red')]
        },

        size: {
            value: 3
        },

        opacity: {
            value: [0, 1]
        },

        particleCount: 2000
    });

    particleGroup.addEmitter(emitter);
    particles.push(particleGroup);
    scene.add(particleGroup.mesh);
};
ps.fire = function (o) {
    let particleGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('/img/glow.png')
        }
    });

    let emitter = new SPE.Emitter({
        maxAge: {
            value: 2
        },
        position: {
            value: new THREE.Vector3(o.x, o.y, o.z),
            spread: new THREE.Vector3(0, 0, 0)
        },

        acceleration: {
            value: new THREE.Vector3(0, -10, 0),
            spread: new THREE.Vector3(10, 0, 10)
        },

        velocity: {
            value: new THREE.Vector3(0, 25, 0),
            spread: new THREE.Vector3(10, 7.5, 10)
        },

        color: {
            value: [new THREE.Color('red'), new THREE.Color('gray')]
        },

        size: {
            value: 1
        },

        particleCount: 2000
    });

    particleGroup.addEmitter(emitter);
    particles.push(particleGroup);
    scene.add(particleGroup.mesh);
};
ps.smoke = function (o) {
    let particleGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('/img/glow.png')
        }
    });
    let emitter = new SPE.Emitter({
        maxAge: {
            value: 3
        },
        position: {
            value: new THREE.Vector3(o.x, o.y, o.z),
            spread: new THREE.Vector3(0, 0, 0)
        },

        acceleration: {
            value: new THREE.Vector3(0, 0, 0),
            spread: new THREE.Vector3(1, 0, 1)
        },

        velocity: {
            value: new THREE.Vector3(0, 10, 0),
            spread: new THREE.Vector3(0, 0, 0)
        },

        color: {
            value: [new THREE.Color('gray')]
        },

        opacity: {
            value: [1, 0]
        },

        size: {
            value: [3, 6]
        },

        particleCount: 200
    });

    particleGroup.addEmitter(emitter);
    particles.push(particleGroup);
    scene.add(particleGroup.mesh);
};