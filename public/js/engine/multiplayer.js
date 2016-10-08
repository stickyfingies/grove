socket.emit('requestOldPlayers', {});

socket.on('createPlayer', data => {
    if (typeof player.serverdata === 'undefined') {

        player.serverdata = data;
        player.id = data.playerId;

        player.inventory = player.serverdata.accountData.inventory;

        animate();

    }
});

socket.on('addOtherPlayer', data => {
    if (data.playerId !== player.id) {
        var cube = box({
            l: 1,
            w: 1,
            h: 2,
            mass: 0
        });
        otherPlayersId.push(data.playerId);
        otherPlayers.push(cube);
        label(cube.mesh, data.accountData.level + ' - ' + data.accountData.username);
    }
});

socket.on('removeOtherPlayer', data => {

    scene.remove(playerForId(data.playerId).mesh);
    world.remove(playerForId(data.playerId).body);
    console.log(data.playerId + ' disconnected');

});

socket.on('updatePosition', data => {

    var somePlayer = playerForId(data.playerId);
    if (somePlayer) {
        somePlayer.body.position.x = data.x;
        somePlayer.body.position.y = data.y;
        somePlayer.body.position.z = data.z;

        // somePlayer.body.quaternion.x = data.quaternion.x;
        // somePlayer.body.quaternion.y = data.quaternion.y;
        // somePlayer.body.quaternion.z = data.quaternion.z;
        // somePlayer.body.quaternion.w = data.quaternion.w;
    }

});

var updatePlayerData = function () {
    player.serverdata.id = player.id;

    player.serverdata.x = BODIES['player'].body.position.x;
    player.serverdata.y = BODIES['player'].body.position.y;
    player.serverdata.z = BODIES['player'].body.position.z;

    player.serverdata.quaternion = BODIES['player'].body.quaternion;
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
    for( var i = scene.children.length - 1; i >= 0; i--) {
        scene.remove(scene.children[i]);
    }
});

socket.on('reload bitch!', function () {
    location.reload();
});