define({
    world: new CANNON.World(),
    camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer({
        antialias: true
    }),
    rendererDEBUG: new THREE.CannonDebugRenderer(this.scene, this.world),

    time: Date.now(),
    debug: false,
    BODIES: [],
    MESHES: [],
    LABELS: [],
    otherPlayers: [],
    otherPlayersId: [],

    controls: null
});