"use strict";

import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    Mesh,
    MeshPhongMaterial,
    BufferAttribute,
    BufferGeometry,
    DataTexture,
    RGBAFormat,
    ImageBitmapLoader,
    CanvasTexture,
    RepeatWrapping,
    LinearFilter,
    BoxGeometry,
    MeshBasicMaterial,
    BackSide,
    LinearMipMapLinearFilter
} from "three";
import { Quaternion } from "cannon-es";

let camera = new PerspectiveCamera(45, 2, 0.01, 10000);
let scene = new Scene();

const init = (data) => {
    const { canvas, width, height, pixelRatio } = data;

    // let context = canvas.getContext("webgl2", { antialias: true });

    const renderer = new WebGLRenderer({
        canvas,
        // context,
        antialias: true
    });
    renderer.setClearColor(0x000000);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(pixelRatio);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    scene.add(camera);

    let light = new DirectionalLight(0xffffff, 1);
    light.position.set(50, 30, 40);
    light.castShadow = true;
    light.shadowMapBias = 0.0036;
    light.shadowMapDarkness = 0.5;
    let { shadow } = light;
    shadow.camera.fov = 70;
    shadow.camera.left = -400;
    shadow.camera.right = 400;
    shadow.camera.top = 100;
    shadow.camera.bottom = -300;
    shadow.mapSize.width = 4096;
    shadow.mapSize.height = 4096;

    scene.add(light);

    let imagePrefix = "/img/skybox/";
    let directions = ["px", "nx", "py", "ny", "pz", "nz"];
    let imageSuffix = ".jpg";
    let skyGeometry = new BoxGeometry(2000, 2000, 2000);

    let materialArray = [];
    let loader = new ImageBitmapLoader();
    loader.setOptions({
        imageOrientation: "flipY"
    });
    for (let i = 0; i < 6; i++) {
        loader.load(imagePrefix + directions[i] + imageSuffix, image => {
            const map = new CanvasTexture(image);
            const mat = new MeshBasicMaterial({
                map,
                side: BackSide,
                fog: false
            });
            materialArray[i] = mat;

            if (materialArray.length == 6) {
                let skyBox = new Mesh(skyGeometry, materialArray);
                scene.add(skyBox);
                scene.updateMatrixWorld();
            }
        });
    }

    const render = () => {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();
};

const updateCamera = ({ p, q, s }) => {
    camera.position.copy(p);
    camera.quaternion.copy(new Quaternion(q._x, q._y, q._z, q._w));
    camera.scale.copy(s);
};

const addObject = ({ geometry, imageData, imageWidth, imageHeight, p, q, s }) => {
    const shallowGeometry = geometry;
    const buffergeo = new BufferGeometry();

    for (let attributeName of Object.keys(shallowGeometry.attributes)) {
        const shallowAttribute = shallowGeometry.attributes[attributeName];
        const attribute = new BufferAttribute(
            shallowAttribute.array,
            shallowAttribute.itemSize,
            false
        );
        buffergeo.addAttribute(attributeName, attribute);
    }

    buffergeo.groups = shallowGeometry.groups;

    let map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.magFilter = LinearFilter;
    map.minFilter = LinearMipMapLinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;
    const mesh = new Mesh(buffergeo, new MeshPhongMaterial({
        map
    }));
    mesh.position.copy(p);
    mesh.quaternion.copy(new Quaternion(q._x, q._y, q._z, q._w));
    mesh.scale.copy(s);
    mesh.updateMatrix();
    scene.add(mesh);
};

const messageHandlers = {
    init,
    updateCamera,
    addObject
};

self.onmessage = ({ data }) => {
    const { type } = data;
    if (messageHandlers[type]) messageHandlers[type](data);
    else console.log("No handler registered for " + type);
};