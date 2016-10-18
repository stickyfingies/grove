/* global CANNON, THREE */

define({
    world: new CANNON.World(),
    camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000),
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer({
        antialias: true
    }),
    rendererDEBUG: new THREE.CannonDebugRenderer(this.scene, this.world),

    time: Date.now(),
    debug: false,
    BODIES: {
        items: [],
        projectiles: []
    },
    MESHES: {
        items: [],
        projectiles: []
    },
    LABELS: [],
    otherPlayers: [],
    otherPlayersId: [],

    controls: null,
    frustum: new THREE.Frustum,
    cameraViewProjectionMatrix: new THREE.Matrix4()
});