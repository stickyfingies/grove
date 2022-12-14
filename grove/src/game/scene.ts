import {
    AmbientLight,
    BackSide,
    BoxBufferGeometry,
    CanvasTexture,
    DirectionalLight,
    ImageBitmapLoader,
    LoadingManager,
    Mesh,
    MeshBasicMaterial,
} from 'three';

import {
    CAMERA_TAG, CameraData, LightData, MeshData,
} from '@grove/graphics';
import { graphics, world } from '@grove/engine';

export default class SceneSetupScript {
    skybox!: number;

    person!: number;

    async init() {
        this.skybox = world.createEntity();
        {
            // skybox state
            const imagePrefix = './img/skybox/';
            const directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
            const imageSuffix = '.jpg';
            const skyGeometry = new BoxBufferGeometry(2000, 2000, 2000);
            const materialArray: MeshBasicMaterial[] = [];

            // load skybox images
            const loadingManager = new LoadingManager(() => {
                const skyboxMesh = new Mesh(skyGeometry, materialArray);
                graphics.addObjectToScene(skyboxMesh);
                world.setComponent(this.skybox, MeshData, skyboxMesh);
            })
            const loader = new ImageBitmapLoader(loadingManager);
            for (let i = 0; i < 6; i++) {
                loader.load(imagePrefix + directions[i] + imageSuffix, (image) => {
                    const map = new CanvasTexture(image);
                    const mat = new MeshBasicMaterial({
                        map,
                        side: BackSide,
                        fog: false,
                    });
                    materialArray[i] = mat;
                });
            }

            // create sun
            const sunlight = new DirectionalLight(0xffffff);
            sunlight.position.set(10, 30, 20);
            graphics.addObjectToScene(sunlight);
        }
    }

    every_frame() {
        // center skybox around camera
        const camera = world.getComponent(world.getTag(CAMERA_TAG), CameraData);
        world.getComponent(this.skybox, MeshData)?.position.copy(camera.position);
    }
}
