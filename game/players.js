'use strict';

let players = [];

function Player() {

    this.playerId = players.length;
    this.accountData = {};
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.r_x = 0;
    this.r_y = 0;
    this.r_z = 0;
    this.sizeX = 1;
    this.sizeY = 1;
    this.sizeZ = 1;
    this.speed = 0.1;
    this.turnSpeed = 0.03;

}

let addPlayer = (id, accountData) => {

    let player = new Player();
    player.playerId = id;
    player.accountData = accountData;
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
    let player = playerForId(data.playerId);
    player.x = data.x;
    player.y = data.y;
    player.z = data.z;
    player.r_x = data.r_x;
    player.r_y = data.r_y;
    player.r_z = data.r_z;

    return player;
};

let playerForId = id => {

    let player;
    for (let i = 0; i < players.length; i++) {
        if (players[i].playerId === id) {

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