define(['globals', 'animate'], function (globals, animate) {
    return function () {
        socket.emit('requestOldPlayers', {});

        socket.on('createPlayer', data => {
            if (typeof player.serverdata === 'undefined') {

                player.serverdata = data;
                player.id = data.playerId;

                player.inventory = player.serverdata.accountData.inventory;

                animate()();

            }
        });

        socket.on('addOtherPlayer', data => {
            // if (data.playerId !== player.id) {
            //     var cube = box({
            //         l: 1,
            //         w: 1,
            //         h: 2,
            //         mass: 0
            //     });
            //     globals.otherPlayersId.push(data.playerId);
            //     globals.otherPlayers.push(cube);
            //     label(cube.mesh, data.accountData.level + ' - ' + data.accountData.username);
            // }
        });

        socket.on('removeOtherPlayer', data => {

            // globals.scene.remove(playerForId(data.playerId).mesh);
            // globals.world.remove(playerForId(data.playerId).body);
            // console.log(data.playerId + ' disconnected');

        });

        socket.on('updatePosition', data => {

            // var somePlayer = playerForId(data.playerId);
            // if (somePlayer) {
            //     somePlayer.body.position.x = data.x;
            //     somePlayer.body.position.y = data.y;
            //     somePlayer.body.position.z = data.z;

            //     // somePlayer.body.quaternion.x = data.quaternion.x;
            //     // somePlayer.body.quaternion.y = data.quaternion.y;
            //     // somePlayer.body.quaternion.z = data.quaternion.z;
            //     // somePlayer.body.quaternion.w = data.quaternion.w;
            // }

        });

        var updatePlayerData = function () {
            player.serverdata.id = player.id;

            player.serverdata.x = globals.BODIES['player'].body.position.x;
            player.serverdata.y = globals.BODIES['player'].body.position.y;
            player.serverdata.z = globals.BODIES['player'].body.position.z;

            player.serverdata.quaternion = globals.BODIES['player'].body.quaternion;
        };


        var playerForId = id => {
            var index;
            for (var i = 0; i < globals.otherPlayersId.length; i++) {
                if (globals.otherPlayersId[i] == id) {
                    index = i;
                    break;
                }
            }
            return globals.otherPlayers[index];
        };

        socket.on('clear', function () {
            for (var i = globals.scene.children.length - 1; i >= 0; i--) {
                globals.scene.remove(globals.scene.children[i]);
            }
        });

        socket.on('reload bitch!', function () {
            location.reload();
        });
    };
});