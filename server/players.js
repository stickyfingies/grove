export const players = [];

function Player() {
    this.id = players.length;
    this.acc = {};
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.q = {}; // quaternion
}

export const addPlayer = (id, accountData) => {
    const player = new Player();
    player.id = id;
    player.acc = accountData;
    players.push(player);

    return player;
};

export const removePlayer = (player) => {
    const index = players.indexOf(player);

    if (index > -1) {
        players.splice(index, 1);
    }
};

export const playerForId = (id) => {
    let player;
    for (let i = 0; i < players.length; i += 1) {
        if (players[i].id === id) {
            player = players[i];
            break;
        }
    }

    return player;
};

export const updatePlayerData = (data) => {
    const player = playerForId(data.id);

    player.x = data.x;
    player.y = data.y;
    player.z = data.z;
    player.q = data.q;

    return player;
};
