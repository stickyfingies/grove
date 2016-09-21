'use strict';
var camera, scene = new THREE.Scene(),
    renderer;
var isJumping = false,
    jumpY = 0,
    mouse = new THREE.Vector2(0, 0);
var sunSphere = new THREEx.DayNight.SunSphere();
var sunLight = new THREEx.DayNight.SunLight();
var skydom = new THREEx.DayNight.Skydom();
var starfield = new THREEx.DayNight.StarField();
var sunAngle = 1 / 6 * Math.PI * 2;
var objects = [],
    ais = [];
var modal = document.getElementById('modal');
var close = $('.modal-close');
var otherPlayers = [],
    otherPlayersId = [];

var controlsEnabled = true;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

var events = postal.channel("events");

var audio = new Audio('/sfx/theme.mp3');
audio.play();

function init() {
    window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    window.controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    window.keyboard = new THREEx.KeyboardState();
    scene.fog = new THREE.FogExp2(0x404040, 0.005);
    var geometry = new THREE.BoxGeometry(5, 10, 15);
    var material = new THREE.MeshLambertMaterial({
        color: 0x888800,
        side: THREE.FrontSide
    });
    socket.emit('requestOldPlayers', {});
    player.init();
    let jason = new MusicGoat(new THREE.Vector3(0, 20, 0));
    render();
}

function genMap() {
    $.getJSON(`https://the-grove.justapis.io/maps/${userdata.map}/`, dat => {
        THREE.DefaultLoadingManager.onProgress = (item, loaded, total) => {
            console.log(item, loaded, total);
            if (loaded == total) {
                $('#total').html('done');
                $('#splash-btn').html("<button class='btn btn-lg btn-success-outline' onclick='hide(\"#splash\");init();'>play</button>");
            }
            else {
                $('#total').width((loaded / total) * 60 + '%');
                $('#total').html(loaded + '/' + total);
            }
        };
        for (var i = 1; i < dat.length; i++) {
            console.log(dat[i]);
            if (obj[dat[i][0]]) obj[dat[i][0]](dat[i][1], dat[i][2], dat[i][3], dat[i][4], dat[i][5], dat[i][6]);
            else links[dat[i][0]](dat[i][1]);
        }
        for (var key in dat[0]) {
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
        scene.add(starfield.object3d);
    });
}
socket.on('createPlayer', data => {
    if (typeof window.userdsata === 'undefined') {

        player.serverdata = data;
        player.id = data.playerId;

        window.userdata = data.accountData;
        document.getElementById('username').innerHTML = (userdata.username + ' - ' + userdata.race + ' <h5>(' + userdata.class + ')</h5>');
        $('.map').text('- ' + userdata.map.capitalize() + ' -');

        player.inventory = userdata.inventory;

        genMap();

    }
    player.init();
});
socket.on('addOtherPlayer', data => {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/villager/villager.json', obj => {
        obj.scale.set(5, 5, 5);
        for (var key in obj.children) {
            objects.push(obj.children[key]);
        }
        scene.add(obj);
        obj.position.set(data.x, data.y, data.z);
        otherPlayersId.push(data.playerId);
        otherPlayers.push(obj);
    });
});
socket.on('removeOtherPlayer', data => {

    scene.remove(playerForId(data.playerId));
    console.log(player);

});
socket.on('updatePosition', data => {

    var somePlayer = playerForId(data.playerId);
    if (somePlayer) {
        somePlayer.position.x = data.x;
        somePlayer.position.y = data.y;
        somePlayer.position.z = data.z;

        somePlayer.rotation.x = data.r_x;
        somePlayer.rotation.y = data.r_y;
        somePlayer.rotation.z = data.r_z;
    }

});
var updatePlayerData = function () {
    player.serverdata.id = player.id;

    player.serverdata.x = controls.getObject().position.x;
    player.serverdata.y = controls.getObject().position.y;
    player.serverdata.z = controls.getObject().position.z;

    player.serverdata.r_x = controls.getObject().rotation.x;
    player.serverdata.r_y = controls.getObject().rotation.y;
    player.serverdata.r_z = controls.getObject().rotation.z;
};


var playerForId = id => {
    var index;
    for (var i = 0; i < otherPlayersId.length; i++) {
        if (otherPlayersId[i] == id) {
            index = i;
            break;
        }
    }
    return otherPlayers[index];
};
socket.on('clear', function () {
    scene.remove(scene.children);
});
socket.on('reload bitch!', function () {
    location.reload();
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
    if (camera instanceof THREE.Camera) camera.aspect = window.innerWidth / window.innerHeight;
    if (camera instanceof THREE.Camera) camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function interact() {
    var direction = new THREE.Vector3();
    var raycaster = new THREE.Raycaster(); // create once and reuse

    controls.getDirection(direction);
    raycaster.set(controls.getObject().position, direction);
    var int = raycaster.intersectObjects(objects, true);
    if (int.length > 0 && int[0].object.callback) int[0].object.callback();
}
document.onmousedown = event => {

    if (camera instanceof THREE.Camera) {
        var raycaster = new THREE.Raycaster();

        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(objects, true);

        if (intersects.length > 0) {
            if (intersects[0].object.callback) intersects[0].object.callback();
        }
    }

};
document.onmousemove = event => {

    if (typeof window.controls !== 'undefined') {
        var direction = new THREE.Vector3();
        var raycaster = new THREE.Raycaster(); // create once and reuse

        controls.getDirection(direction);
        raycaster.set(controls.getObject().position, direction);
        var int = raycaster.intersectObjects(objects, true);
        if (int.length > 0) $('#obj-name').text(controls.getObject().position.distanceTo(int[0].object.position));
        else $('#obj-name').text('');
    }

};
document.onkeyup = e => {
    if (e.keyCode === 80)
        gui.quests();
    if (e.keyCode === 73)
        gui.inventory();
    if (e.keyCode === 69)
        interact();
};