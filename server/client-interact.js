// eslint-disable-next-line import/extensions
import { dbFindUser } from './mongo.js';
// eslint-disable-next-line import/extensions
import physics from './physics.js';
import {
    addPlayer,
    playerForId,
    players,
    removePlayer,
    updatePlayerData,
    // eslint-disable-next-line import/extensions
} from './players.js';

export default (io) => {
    io.on('connection', (socket) => {
    // client sends server account data, and server checks if it is valid.
    // This is rather backwards, but it works :*]
        socket.on('client-credentials', async (creds) => {
            const user = await dbFindUser(creds);

            if (!user) { console.error('Username incorrect for multiplayer!'); }

            addPlayer(socket.id, user);
            const player = playerForId(socket.id);

            socket.on('requestOldPlayers', () => {
                for (let i = 0; i < players.length; i++) {
                    if (players[i].id !== socket.id) { socket.emit('addOtherPlayer', players[i]); }
                }

                socket.emit('createPlayer', player);
                socket.broadcast.emit('addOtherPlayer', player);
            });

            // when a client moves, rotates, etc.
            socket.on('updatePosition', (data) => {
                const newData = updatePlayerData(data);
                socket.broadcast.emit('updatePosition', newData);
            });

            /// ///////////////////////////////////////////////

            physics(socket, io);

            /// ///////////////////////////////////////////////

            // client interacted with their inventory
            socket.on('inventory-update', async (dat) => {
                const user = await dbFindUser(dat.user);
                if (user) {
                    user.inventory = dat.inv;
                    user.save();
                } else console.log('Credentials not valid!');
            });

            // client changed maps
            socket.on('map-update', async (dat) => {
                const user = await db.dbFindUser(dat.user);
                if (user) {
                    user.map = dat.map;
                    user.save();
                    socket.emit('reload', true);
                } else console.log('Credentials not valid!');
            });

            /// ///////////////////////////////////////////////

            // chat handler
            socket.on('chat-msg', (player, msg) => {
                console.log(`${new Date()}Chat Message: ${player} said, ${msg}`);
                io.emit('chat-msg', player, msg);
            });

            // client left :(
            socket.on('disconnect', () => {
                console.log(`${new Date() + player.username} has exited game play.    `);
                io.emit('removeOtherPlayer', player);
                removePlayer(player);
            }); //
        }); //
    }); //
}; //
