/**
 * ===========================
 * Adding and Removing Objects
 * ===========================
 *
 * The situation is a little complicated, but it effectively works like this:
 *
 * Every time we create an object, we associate it with a unique ID that we can use to set/retrieve
 * its transform info from the shared array buffer.  When we delete an object, we recycle its ID, so
 * that future entities can reuse that slot in the shared buffer.  We do this by adding the removed
 * entity's ID to a list, `availableEntityIds`.  Whenever a new entity is added to the scene, we
 * first check that list to see if we can recycle any old, unused entity IDs.  If we cannot do that,
 * we increment a global counter and use that as the entity's ID - effectively, putting it at the
 * end of the shared array buffer.
 */

import {
    AnimationAction,
    AnimationMixer,
    Camera,
    Clock,
    Group,
    InstancedMesh,
    Light,
    Material,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    Sprite,
    Texture,
    WebGLRenderer
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export type CameraData = Camera;
// eslint-disable-next-line no-redeclare
export const CameraData = Camera;

export type MeshData = Mesh;
// eslint-disable-next-line no-redeclare
export const MeshData = Mesh;

export type SpriteData = Sprite;
// eslint-disable-next-line no-redeclare
export const SpriteData = Sprite;

export type LightData = Light;
// eslint-disable-next-line no-redeclare
export const LightData = Light;

/**
 * Entity tag used to retrieve the main camera
 * @example Entity.getTag(CAMERA_TAG)
 */
export const CAMERA_TAG = Symbol('camera');

type LogFn = (payload: object | string | number) => void;
let [log, report]: LogFn[] = [console.log, console.error];

export type Model = {

    current_animation?: AnimationAction;
    animations: Map<string, AnimationAction>,
    mixer: AnimationMixer,
    mesh: Object3D,

};

export function animate(model: Model, animation: string) {
    
    // Get
    const new_animation = model.animations.get(animation);
    if (!new_animation) { return console.error('No such animation called ' + animation); }
    // Check
    if (new_animation == model.current_animation) return;
    // Fade
    if (new_animation != model.current_animation) {
        if (model.current_animation) model.current_animation.fadeOut(1)
        model.current_animation = new_animation;
        model.current_animation.reset()
        model.current_animation.fadeIn(1)
        model.current_animation.play()
    }

}

export class Graphics {

    #models: Model[] = [];

    #clock = new Clock();

    #renderer = new WebGLRenderer();

    #scene = new Scene();
    get scene() { return this.#scene; }

    #camera: Camera = new PerspectiveCamera();
    get camera() { return this.#camera; }

    constructor(logService?: LogFn[], workerLogService?: LogFn[]) {
        // inject logging functions
        if (logService) {
            [log, report] = logService;
        }

        // Useful for debugging the library itself
        log(import.meta.url);
    }

    /**
     * Initialize the whole graphics stack.  This starts communication with
     * the worker thread, attaches listeners, and creates the canvas.
     * 
     * @param canvasID ID of HTMLCanvasElement to render to.
     *                 Creates a new element if one cannot be found.
     */
    async init(canvasID: string = 'main-canvas') {
        this.#scene.add(this.#camera);

        // find (or create) canvas element
        let canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.#renderer = new WebGLRenderer({
            canvas,
            antialias: true,
        });

        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.setSize(window.innerWidth, window.innerHeight);

        // attach graphics backend to resize event hook
        window.addEventListener('resize', () => {
            this.#renderer.setPixelRatio(window.devicePixelRatio);
            this.#renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    async loadModel() {
        
        // model.gltf
        const loader = new GLTFLoader().setPath('models/Adventurers/Characters/gltf/');
        const gltf = await loader.loadAsync('Mage.glb');
        
        // anim_name -> anim_action
        const mixer = new AnimationMixer(gltf.scene);
        const model: Model = { animations: new Map(), mixer, mesh: gltf.scene };
        for (const animation of gltf.animations) {
            model.animations.set(animation.name, mixer.clipAction(animation));
        }
        
        // ref tracking
        this.#models.push(model);

        return model;
    }

    update() {
        const delta = this.#clock.getDelta();

        for (const model of this.#models) {
            model.mixer.update(delta);
        }
        this.#renderer.render(this.#scene, this.#camera);
    }

    /**
     * Upload queued graphics commands to backend & clear queue
     */
    flushCommands() { }

    changeCamera(camera: Camera) {
        this.#camera = camera;
        log(camera.userData.meshId);
    }

    updateMaterial(object: Mesh | Points | Sprite, ui = false) { }

    removeObjectFromScene(object: Object3D) {

        this.#scene.remove(object);
    }

    createParticleEmitter(map: Texture) {
        return null;
    }

    addObjectToScene(object: Mesh | InstancedMesh | Light | Sprite | Group, ui = false) {
        if (object.parent) object.parent.add(object);
        else this.#scene.add(object);
    }
}
