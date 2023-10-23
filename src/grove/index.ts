import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let mixer: THREE.AnimationMixer = null!;
const animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction = null!;
let pastAction: THREE.AnimationAction = null!;
const loader = new GLTFLoader().setPath('models/');
loader.load('fullstatue.glb', function (gltf) {
    console.log(gltf.scene);
    console.log(gltf.animations);
    mixer = new THREE.AnimationMixer(gltf.scene);
    for (const animation of gltf.animations) {
        const action = mixer.clipAction(animation);
        animationActions.push(action);
    }
    activeAction = animationActions[0];
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    scene.add(gltf.scene);
});

console.log(animationActions);

setInterval(() => {
    const idx = Math.floor(Math.random() * animationActions.length);
    setAction(animationActions[idx]);
}, 4000);

const setAction = (toAction: THREE.AnimationAction) => {
    if (toAction != activeAction) {
        pastAction = activeAction;
        activeAction = toAction;
        //lastAction.stop()
        pastAction.fadeOut(1);
        activeAction.reset();
        activeAction.fadeIn(1);
        activeAction.play();
    }
};

const light = new THREE.AmbientLight(0xff0000, 30);
scene.add(light);

const pointlight = new THREE.PointLight(0xffff00);
pointlight.position.set(0, -50, 50);
scene.add(pointlight);

camera.position.z = 50;

const clock = new THREE.Clock();
function animate() {

    requestAnimationFrame(animate);

    if (mixer) mixer.update(clock.getDelta());

    renderer.render(scene, camera);
}

animate();