'use strict';

let players = [];

function Player() {

    this.id = players.length;
    this.acc = {};
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.q = {}; // quaternion

}

let addPlayer = (id, accountData) => {

    let player = new Player();
    player.id = id;
    player.acc = accountData;
    players.push(player);

    return player;
};

let removePlayer = player => {

    let index = players.indexOf(player);

    if (index > -1) {
        players.splice(index, 1);
    }
};

let updatePlayerData = data => {
    let player = playerForId(data.id);
    
    player.x = data.x;
    player.y = data.y;
    player.z = data.z;
    player.q = data.q;

    return player;
};

let playerForId = id => {

    let player;
    for (let i = 0; i < players.length; i++) {
        if (players[i].id === id) {

            player = players[i];
            break;

        }
    }

    return player;
};

module.exports.players = players;
module.exports.addPlayer = addPlayer;
module.exports.removePlayer = removePlayer;
module.exports.updatePlayerData = updatePlayerData;
module.exports.playerForId = playerForId;