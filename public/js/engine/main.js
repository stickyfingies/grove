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
var starfield = new THREEx.DayNight.StarField();
var sunAngle = 1 / 6 * Math.PI * 2;
var objects = [],
    ais = [];
contact = false; //wut be contact 4 (wheel drive)
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
    window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    window.keyboard = new THREEx.KeyboardState();
    scene.fog = new THREE.FogExp2(0x404040, 0.005);
    var geometry = new THREE.BoxGeometry(5, 10, 15);
    var material = new THREE.MeshLambertMaterial({
        color: 0x888800,
        side: THREE.FrontSide
    });
    $.getJSON('//uinames.com/api/', function (json) {
        console.log(json);
    });
    socket.emit('requestOldPlayers', {});
    // player.init();
}

socket.on('genMap', function (dat) {
    if (scene.children.length <= 1 && objects.length <= 5) {
        THREE.DefaultLoadingManager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
            if (loaded == total) {
                $('#total').html('done');
                $('#splash-btn').html("<button class='btn btn-lg btn-success-outline' onclick='hide(\"#splash\");init();'>play</button>");
            }
            else {
                $('#total').width((loaded / total) * 60 + '%');
                $('#total').html(item);
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
    }
});
socket.on('createPlayer', function (data) {
    if (typeof window.userdata === 'undefined') {

        console.log(data);
        player.serverdata = data;
        player.id = data.playerId;

        window.userdata = data.accountData;
        document.getElementById('username').innerHTML = (userdata.username + ' - ' + userdata.race + ' <h5>(' + userdata.class + ')</h5>');
        $('.map').text('- ' + userdata.map.capitalize() + ' -');

        player.inventory = userdata.inventory;

    }
    player.init();
});
socket.on('addOtherPlayer', function (data) {
    var _loader = new THREE.ObjectLoader();
    _loader.load('/img/villager/villager.json', function (obj) {
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
socket.on('removeOtherPlayer', function (data) {

    scene.remove(playerForId(data.playerId));
    console.log(player);

});
socket.on('updatePosition', function (data) {

    var somePlayer = playerForId(data.playerId);

    somePlayer.position.x = data.x;
    somePlayer.position.y = data.y;
    somePlayer.position.z = data.z;

    somePlayer.rotation.x = data.r_x;
    somePlayer.rotation.y = data.r_y;
    somePlayer.rotation.z = data.r_z;

});
var updatePlayerData = function () {
    player.serverdata.id = player.id;

    player.serverdata.x = player.shape.position.x;
    player.serverdata.y = player.shape.position.y;
    player.serverdata.z = player.shape.position.z;

    player.serverdata.r_x = player.shape.rotation.x;
    player.serverdata.r_y = player.shape.rotation.y;
    player.serverdata.r_z = player.shape.rotation.z;
};


var playerForId = function (id) {
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

var mouse = new THREE.Vector2();

document.onmousedown = function (event) {

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
document.onmousemove = function (event) {

    mouse.x = (event.clientX - window.innerWidth / 2) / 2;
    mouse.y = (event.clientY - window.innerHeight / 2) / 3;

};
document.onkeypress = function (e) {
    if (e.keyCode === 80)
        gui.quests();
};