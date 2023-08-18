import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let mixer: THREE.AnimationMixer = null!;
let animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction = null!;
let pastAction: THREE.AnimationAction = null!;
const loader = new GLTFLoader().setPath('models/Adventurers/Characters/gltf/');
loader.load('Knight.glb', function (gltf) {
	console.log(gltf.animations);
	mixer = new THREE.AnimationMixer(gltf.scene);
	for (const animation of gltf.animations) {
		let action = mixer.clipAction(animation);
		animationActions.push(action);
	}
	activeAction = animationActions[0];
	scene.add(gltf.scene);
});

setInterval(() => {
	const idx = Math.floor(Math.random() * animationActions.length);
	setAction(animationActions[idx]);
}, 4000);

const setAction = (toAction: THREE.AnimationAction) => {
	if (toAction != activeAction) {
		pastAction = activeAction
		activeAction = toAction
		//lastAction.stop()
		pastAction.fadeOut(1)
		activeAction.reset()
		activeAction.fadeIn(1)
		activeAction.play()
	}
}

const light = new THREE.AmbientLight(0x222222, 30);
scene.add(light);

camera.position.z = 5;

const clock = new THREE.Clock()
function animate() {

	requestAnimationFrame(animate);

	if (mixer) mixer.update(clock.getDelta());

	renderer.render(scene, camera);
}

animate();