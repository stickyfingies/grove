"use strict";

import manager from "./init/manager";
import AI from "./AI";

export default (globals, player) => {

    $(window).bind("online", () => Materialize.toast('Connection restored', 4000));
    $(window).bind("offline", () => Materialize.toast('Connection lost', 4000));

    globals.socket.emit('client-credentials', {
        username: window.__D.username,
        password: window.__D.password
    });

    window.__D = undefined;
    delete window.__D;

    globals.socket.emit('requestOldPlayers', {});

    globals.socket.on('createPlayer', data => {
        if (typeof player.serverdata === 'undefined') {

            player.serverdata = data;
            player.id = data.id;

            //Object.assign(player.inventory, player.serverdata.acc.inventory); // GOD!

            manager(globals, player);

            AI(globals);

        }
    });

    globals.socket.on('addOtherPlayer', data => {
        if (data.id !== player.id) {
            new THREE.ObjectLoader().load('/models/character-model/character-model.json', character => {
                let cube = globals.box({
                    l: 1,
                    w: 1,
                    h: 1,
                    mass: 0,
                    mesh: character,
                    norotate: true
                });
                globals.PLAYERS.push({
                    body: cube.body,
                    mesh: cube.mesh,
                    id: data.id,
                    data
                });
                globals.label(cube.mesh, data.acc.level + ' - ' + data.acc.username);
                Materialize.toast(`<span style='color:lightblue'>${data.acc.username} joined</span>`, 4000);
            });
        }
    });

    globals.socket.on('removeOtherPlayer', data => {

        if (playerForId(data.id).mesh) {
            globals.scene.remove(playerForId(data.id).mesh);
            globals.world.remove(playerForId(data.id).body);
            Materialize.toast(`${data.acc.username} left`, 4000);
            console.log(data.id + ' disconnected');
        }

    });

    globals.socket.on('updatePosition', data => {

        let somePlayer = playerForId(data.id);
        if (somePlayer) {
            somePlayer.body.position.x = data.x;
            somePlayer.body.position.y = data.y;
            somePlayer.body.position.z = data.z;

            // somePlayer.body.q.x = data.q.x;
            // somePlayer.body.q.y = data.q.y;
            // somePlayer.body.q.z = data.q.z;
            // somePlayer.body.q.w = data.q.w;
        }

    });

    globals.socket.on('bullet', ({
        pos,
        vel,
    }) => {
        let ball = globals.ball({
            array: 'projectiles'
        });
        ball.body.position.set(pos.x, pos.y, pos.z);
        ball.body.velocity.set(vel.x, vel.y, vel.z);
        ball.mesh.position.set(pos.x, pos.y, pos.z);

        ball.body.addEventListener("collide", event => {
            setTimeout(() => {
                globals.remove.bodies.push(ball.body);
                globals.remove.meshes.push(ball.mesh);
            }, 1500);
        });
    });

    globals.socket.on('hit', data => {
        if (data.id == player.id) player.hp.val--;
    });


    var updatePlayerData = () => {

        player.serverdata.x = globals.BODIES['player'].body.position.x;
        player.serverdata.y = globals.BODIES['player'].body.position.y;
        player.serverdata.z = globals.BODIES['player'].body.position.z;

        player.serverdata.q = globals.BODIES['player'].body.quaternion;

    };

    var playerForId = id => {
        let index;
        for (let i = 0; i < globals.PLAYERS.length; i++) {
            if (globals.PLAYERS[i].id == id) {
                index = i;
                break;
            }
        }
        return globals.PLAYERS[index];
    };
    // CHAT STARTS HERE
    globals.socket.on('chat-msg', (player, msg) => {
        if (/\\g/gi.test(msg)) globals.world.gravity.set(0, 0, 0);
        Materialize.toast(`${player}: ${msg}`, 10000);
    });

    let msgs = 0; // prevents spam

    $(window).on('keydown', e => {
        if (e.keyCode == 13 && $('#chat-input').is(':focus') && msgs < 5) {
            globals.socket.emit('chat-msg', player.serverdata.acc.username, $('#chat-input').val());
            $('#chat-input').val('');
            $('#chat-input').blur();
            msgs++;
            setTimeout(() => {
                msgs--;
            }, 5000);
        }
        else if (e.keyCode == 84 && !$('#chat-input').is(':focus')) {
            setTimeout(() => {
                $('#chat-input').focus();
                $('#chat-input').val(' ');
            }, 100);
        }
    });
    // Button for chat is [t]
    // Button to send chat is [enter]
    // CHAT ENDS HERE
    globals.socket.on('clear', () => {
        for (var i = globals.scene.children.length - 1; i >= 0; i--) {
            globals.scene.remove(globals.scene.children[i]);
        }
    });

    globals.socket.on('reload', () => window.location.reload());

    globals.updatePlayerData = updatePlayerData;
    globals.playerForId = playerForId;

};
