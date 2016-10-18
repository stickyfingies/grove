'use strict';
var players = require('../server/players');

module.exports = (io, User, conf_url) => {

  io.on('connection', socket => {

    socket.on('client-credentials', creds => {

      User.findOne({
        username: creds.username,
        password: creds.password
      }, (err, o) => {

        // check for potential errors
        if (err) console.err(err);
        // user not found (in case this ever happened)
        if (!o) console.error('USER NOT FOUND FOR MULTIPLAYER\n\n\n\n');

        // add the new player to list of players
        players.addPlayer(socket.id, o);
        // get player we just made
        let player = players.playerForId(socket.id);

        // when client asks for players that were there before they joined
        socket.on('requestOldPlayers', function () {
          for (let i = 0; i < players.players.length; i++) {
            if (players.players[i].playerId != socket.id)
              socket.emit('addOtherPlayer', players.players[i]);
          }

          // tell this client to create a new player
          socket.emit('createPlayer', player);
          // tell other clients we just made a player
          socket.broadcast.emit('addOtherPlayer', player);

        });

        // when a client moves, rotates, etc.
        socket.on('updatePosition', data => {
          let newData = players.updatePlayerData(data);
          socket.broadcast.emit('updatePosition', newData);
        });

        //////////////////////////////////////////////////

        // client interacted with their inventory
        socket.on('inventory-update', dat => {
          User.findOne({
            username: dat.user.username,
            password: dat.user.password
          }, (err, obj) => {
            if (err) console.log('ERROR!\n\n\n\n');
            if (obj) {
              obj.inventory = dat.inv;
              obj.save();
            }
            else console.log('Credentials not valid!\n\n\n\n');
          });
        });

        // client changed maps
        socket.on('map-update', dat => {
          User.findOne({
            username: dat.user.username,
            password: dat.user.password
          }, (err, obj) => {
            if (err) console.log('ERROR!\n\n\n\n');
            if (obj) {
              obj.map = dat.map;
              obj.save();
              socket.emit('reload', true);
            }
            else console.log('Credentials not valid!\n\n\n\n');
          });
        });

        //////////////////////////////////////////////////

        // chat handler
        socket.on('chat message', msg => {
          console.log('message: ' + msg);
          io.emit('chat message', msg);
        });

        // client left :(
        socket.on('disconnect', function () {
          console.log(player.accountData.username + ' has logged off.\n\n\n\n');
          io.emit('removeOtherPlayer', player);
          players.removePlayer(player);
        }); //

      }); //

    }); //

  }); //

}; //