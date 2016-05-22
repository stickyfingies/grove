var camera, scene = new THREE.Scene(),
    renderer;
var geometry, material, mesh;
var controls, raycaster, _raycaster, _raycaster2, isJumping = false,
    jumpY = 0,
    cameraoffset = 0,
    viewType = false,
    open,
    mouse = new THREE.Vector2(0, 0);
var sunSphere = new THREEx.DayNight.SunSphere();
var sunLight = new THREEx.DayNight.SunLight();
var skydom = new THREEx.DayNight.Skydom();
var sunAngle = -1 / 6 * Math.PI * 2;
var objects = [],
    ais = [];
contact = false; //wut be contact 4 (wheel drive)
var modal = document.getElementById('modal');
var close = $('.modal-close');
var sfx = new Audio('/sfx/title.mp3');
sfx.preload = 'auto';
sfx.loop = true;
//sfx.play();

var controlsEnabled = true;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

var events = postal.channel("events");

function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
    window.keyboard = new THREEx.KeyboardState();
    scene.fog = new THREE.FogExp2(0x404040, 0.005);
    var geometry = new THREE.BoxGeometry(5, 10, 15);
    var material = new THREE.MeshLambertMaterial({
        color: 0x888800,
        side: THREE.FrontSide
    });
    player.init();
}

socket.on('genMap', function (dat) {
    if (scene.children.length <= 1 && objects.length <= 5) {
        init();
        for (var i = 1; i < dat.length; i++) {
            console.log(dat[i]);
            obj[dat[i][0]](dat[i][1], dat[i][2], dat[i][3], dat[i][4], dat[i][5], dat[i][6]);
        }
        for(var key in dat[0]) {
            questQue.push(dat[0][key]);
        }
        quest(questQue[0]);
        for (var o in objects) {
            scene.add(objects[o]);
        }
        scene.add(sunSphere.object3d);
        objects.push(sunSphere.object3d);
        scene.add(sunLight.object3d);
        scene.add(sunLight.Alight);
        scene.add(skydom.object3d);
    }
});


renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.shadowMapEnabled = true;
renderer.setClearColor(0x00ccff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var mouse = new THREE.Vector2();

document.onmousedown = function (event) {

    var raycaster = new THREE.Raycaster();
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        if (intersects[0].object.callback) intersects[0].object.callback();
    }

};
document.onmousemove = function (event) {

    var raycaster = new THREE.Raycaster();
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        document.getElementById('description').innerText = intersects[0].object.name;
    }

    mouse.x = (event.clientX - window.innerWidth / 2) / 2;
    mouse.y = (event.clientY - window.innerHeight / 2) / 3;

}