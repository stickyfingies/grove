"use strict";

import {load, loadModel} from "../load";

import {Fog, DirectionalLight, Sprite, SpriteMaterial, ImageUtils, NormalBlending, BackSide, Vector2, BoxGeometry, Mesh, MeshBasicMaterial, ShaderMaterial, HemisphereLight} from "three";

export default (globals) => {
    globals.scene.fog = new Fog(0xFFFFFF, 2);
 
    let light = new DirectionalLight(0xffffff, 1);
    light.position.set(50, 30, 40);
    light.castShadow = true;
    light.shadowMapBias = 0.0036;
    light.shadowMapDarkness = 0.5;
    let {shadow: {camera, mapSize}} = light;
    camera.near = globals.camera.near;
    camera.far = globals.camera.far;
    camera.fov = 70;
    camera.left = -400;
    camera.right = 400;
    camera.top = 100;
    camera.bottom = -300;
    mapSize.width = 4096;
    mapSize.height = 4096;

    globals.scene.add(light);

    let spriteMaterial = new SpriteMaterial({
        map: new ImageUtils.loadTexture("/img/glow.png"),
        color: 0xffaaaa,
        transparent: false,
        blending: NormalBlending
    });
    let sprite = new Sprite(spriteMaterial);
    sprite.scale.set(100, 100, 1.0);
    light.add(sprite);

    let uni = {
        time: {
            value: 1.0
        },
        resolution: {
            value: new Vector2()
        }
    };

    setInterval(() => {
        uni.time.value += 0.1;
        // let time = new Date().getTime() * 0.000015;
        let time = 2.1;
        const nsin = Math.sin(time);
        const ncos = Math.cos(time);
        
        light.position.set(450 * nsin, 600 * nsin, 600 * ncos);

    }, 40);

    var hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.2);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);
    globals.scene.add(hemiLight);

    let imagePrefix = "/img/skybox/";
    let directions = ["px", "nx", "py", "ny", "pz", "nz"];
    let imageSuffix = ".jpg";
    let skyGeometry = new BoxGeometry(2000, 2000, 2000);

    let materialArray = [];
    for (var i = 0; i < 6; i++) {
        materialArray.push(new MeshBasicMaterial({
            map: ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
            side: BackSide,
            fog: false
        }));
    }
    var skyBox = new Mesh(skyGeometry, materialArray);
    globals.BODIES["player"].mesh.add(skyBox);

    loadModel(`/models/skjar-isles/skjar-isles.json`, object => {
        globals.scene.add(object);
        object.castShadow = true;
        object.recieveShadow = true;
        object.traverse(child => {
            if (child instanceof Mesh) {
                console.log(child.name);
                child.castShadow = true;
                child.recieveShadow = true;
                load(child, {
                    mass: 0,
                    material: globals.groundMaterial
                }, globals);
            }
        });
    });
};
