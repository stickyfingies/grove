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
    LinearMipMapLinearFilter,
    Vector3,
    Quaternion,
    Object3D
} from "three";

let camera = new PerspectiveCamera(45, 2, 0.01, 2000);
let scene = new Scene();
let renderer: WebGLRenderer;

/**
 * map from id -> object
 * automatically copy transform from buffer @ id
 */

let entityMap = [] as Object3D[];
let entityId = 0;

// let geometryCache = {};
let textureCache = {} as any;

const init = (data: any) => {
    const { canvas, buffer, width, height, pixelRatio } = data;

    // this is our array of object transforms.
    // currently, it only contains the camera
    let tArr = new Float32Array(buffer);

    let context = canvas.getContext("webgl2", { antialias: true });

    renderer = new WebGLRenderer({
        canvas,
        context,
        antialias: true
    });
    renderer.setClearColor(0x000000);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = true;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    entityMap[entityId++] = camera;
    scene.add(camera);

    let cube = new Mesh(new BoxGeometry(6, 6, 6), new MeshPhongMaterial({
        color: 0xff0000
    }));
    cube.position.y = 30;
    scene.add(cube);

    let light = new DirectionalLight(0xffffff, 1);
    light.position.set(10, 30, -20);
    light.castShadow = true;
    let { shadow } = light;
    shadow.camera.left = -1024;
    shadow.camera.right = 1024;
    shadow.camera.top = 1024;
    shadow.camera.bottom = -1024;
    shadow.mapSize.width = 1024;
    shadow.mapSize.height = 1024;

    scene.add(light);

    let imagePrefix = "/img/skybox/";
    let directions = ["px", "nx", "py", "ny", "pz", "nz"];
    let imageSuffix = ".jpg";
    let skyGeometry = new BoxGeometry(2000, 2000, 2000);

    let skybox = new Object3D();
    let materialArray = [] as MeshBasicMaterial[];
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

            // this if condition is true more than once (why?)
            if (materialArray.length == 6 && !(skybox as Mesh).material) {
                skybox = new Mesh(skyGeometry, materialArray);
                scene.add(skybox);
            }
        });
    }

    const render = () => {
        cube.rotateY(0.01);
        skybox.rotateY(0.0001);
        for (let id in entityMap) {
            let object = entityMap[id];
            const offset = Number(id) * 10;
            object.position.copy(new Vector3(tArr[offset + 0], tArr[offset + 1], tArr[offset + 2]));
            object.quaternion.copy(new Quaternion(tArr[offset + 3], tArr[offset + 4], tArr[offset + 5], tArr[offset + 6]));
            // object.scale.copy(new Vector3(tArr[offset + 7], tArr[offset + 8], tArr[offset + 9]));

            // something about scale is reporting values of 0,0,0 for entities 1-15
            // it's causing three to spit out a bunch of warnings and frankly, i don't
            // have the energy to fix it.  so for now, we don't apply scales
        }

        skybox.position.copy(camera.position);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    render();
};

export const uploadTexture = ({ imageName, imageData, imageWidth, imageHeight }: any) => {
    if (textureCache[imageName]) return;

    let map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.magFilter = LinearFilter;
    map.minFilter = LinearMipMapLinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;

    textureCache[imageName] = map;
};

const addObject = ({ geometry, imageName }: any) => {
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

    const mesh = new Mesh(buffergeo, new MeshPhongMaterial());
    if (imageName) mesh.material.map = textureCache[imageName];
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    entityMap[entityId++] = mesh;
};

const resize = ({ width, height }: any) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
};

const messageHandlers = {
    init,
    uploadTexture,
    addObject,
    resize
} as any;

self.onmessage = ({ data }: any) => {
    const { type } = data;
    if (messageHandlers[type]) messageHandlers[type](data);
    else console.error("no graphics handler registered for " + type);
};