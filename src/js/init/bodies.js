/* global THREE, SPE */

module.exports = (globals, player) => {

    globals.scene.fog = new THREE.Fog(0xFFFFFF, 2);

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 30, 40);
    light.castShadow = true;

    light.shadowCameraNear = globals.camera.near;
    light.shadowCameraFar = globals.camera.far;
    light.shadowCameraFov = 70;
    light.shadowCameraLeft = -400;
    light.shadowCameraRight = 400;
    light.shadowCameraTop = 100;
    light.shadowCameraBottom = -300;

    light.shadowMapBias = 0.0036;
    light.shadowMapDarkness = 0.5;
    light.shadowMapWidth = 4096;
    light.shadowMapHeight = 4096;

    light.shadowCameraVisible = true;
    globals.scene.add(light);
    var spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.ImageUtils.loadTexture('/img/glow.png'),
        color: 0xffaaaa,
        transparent: false,
        blending: THREE.AdditiveBlending
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 100, 1.0);
    light.add(sprite);

    let uni = {
        time: {
            value: 1.0
        },
        resolution: {
            value: new THREE.Vector2()
        }
    };

    setInterval(() => {
        uni.time.value += 0.1;
        // let time = new Date().getTime() * 0.000015;
        let time = 2.1;
        let nsin = Math.sin(time);
        let ncos = Math.cos(time);
        // set the sun
        light.position.set(450 * nsin, 600 * nsin, 600 * ncos);

    }, 40);

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);
    globals.scene.add(hemiLight);

    let imagePrefix = "/img/skybox/";
    let directions = ["px", "nx", "py", "ny", "pz", "nz"];
    let imageSuffix = ".jpg";
    let skyGeometry = new THREE.CubeGeometry(2000, 2000, 2000);

    let materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide,
            fog: false
        }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    globals.BODIES['player'].mesh.add(skyBox);


    let loader = new THREE.ObjectLoader();
    loader.load(`/models/skjar-isles/skjar-isles.json`, object => {
        globals.scene.add(object);
        object.castShadow = true;
        object.recieveShadow = true;
        object.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.recieveShadow = true;
                let body;
                if (!/NP/gi.test(child.name)) body = globals.load(child, {
                    mass: 0,
                    material: globals.groundMaterial
                });
                if (/portal/gi.test(child.name)) {
                    // let sound = new THREE.PositionalAudio(globals.listener);
                    // let oscillator = globals.listener.context.createOscillator();
                    // oscillator.type = 'sine';
                    // oscillator.frequency.value = 200;
                    // oscillator.start();
                    // sound.setNodeSource(oscillator);
                    // sound.setRefDistance(20);
                    // sound.setVolume(1);
                    // child.add(sound);

                    child.material = new THREE.ShaderMaterial({
                        uniforms: uni,
                        vertexShader: document.getElementById('V_PortalShader').textContent,
                        fragmentShader: document.getElementById('F_PortalShader').textContent
                    });
                    child.add(new THREE.PointLight(0xFFFFFF, 1, 25, 2));
                }
                if (/bridge/gi.test(child.name)) {
                    // let audioLoader = new THREE.AudioLoader();
                    // let sound = new THREE.PositionalAudio(globals.listener);
                    // let sound2 = new THREE.PositionalAudio(globals.listener);
                    // audioLoader.load('/audio/creak.wav', (buffer) => {
                    //     sound.setBuffer(buffer);
                    //     sound.setRefDistance(5);
                    //     sound.setLoop(true);
                    //     sound.play();
                    // });
                    // audioLoader.load('/audio/creak2.wav', (buffer) => {
                    //     sound2.setBuffer(buffer);
                    //     sound2.setRefDistance(5);
                    //     sound2.setLoop(true);
                    //     sound2.play();
                    // });
                    // child.add(sound);
                    // child.add(sound2);

                    let tween = new TWEEN.Tween(child.rotation)
                        .to({
                            y: -Math.PI / 8
                        }, 4000)
                        .repeat(Infinity)
                        .yoyo(true)
                        .start();

                    globals.TWEENS.push(tween);
                }
            }
        });
    });

};
