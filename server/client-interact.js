'use strict';
var players = require('../server/players');

module.exports = (io, User, conf_url) => {

  io.on('connection', socket => {

    // client sends server account data, and server checks if it is valid.
    // This is rather backwards, but it works :*]
    socket.on('client-credentials', creds => {

      User.findOne({
        username: creds.username,
        password: creds.password
      }, (err, o) => {

        // check for potential errors
        if (err) console.err(err);
        // user not found (in case this ever happened)
        if (!o) console.error(new Date() + ' Username incorrect for multiplayer!');

        // add the new player to list of players
        players.addPlayer(socket.id, o);
        // get player we just made
        let player = players.playerForId(socket.id);

        // when client asks for players that were there before they joined
        socket.on('requestOldPlayers', function() {
          for (let i = 0; i < players.players.length; i++) {
            if (players.players[i].id != socket.id)
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

        require('./physics')(socket, io);

        //////////////////////////////////////////////////

        // client interacted with their inventory
        socket.on('inventory-update', dat => {
          User.findOne({
            username: dat.user.username,
            password: dat.user.password
          }, (err, obj) => {
            if (err) console.log(new Date() + 'ERROR!');
            if (obj) {
              obj.inventory = dat.inv;
              obj.save();
            }
            else console.log(new Date() + 'Credentials not valid!');
          });
        });

        // client changed maps
        socket.on('map-update', dat => {
          User.findOne({
            username: dat.username,
            password: dat.password
          }, (err, obj) => {
            if (err) console.log(new Date() + 'ERROR!    ');
            if (obj) {
              obj.map = dat.map;
              obj.save();
              socket.emit('reload', true);
            }
            else console.log(new Date() + 'Credentials not valid!    ');
          });
        });

        //////////////////////////////////////////////////

        // chat handler
        socket.on('chat-msg', (player, msg) => {
          console.log(new Date() + 'Chat Message: ' + player + ' said, ' + msg);
          io.emit('chat-msg', player, msg);
        });

        // client left :(
        socket.on('disconnect', function() {
          console.log(new Date() + player.acc.username + ' has exited game play.    ');
          io.emit('removeOtherPlayer', player);
          players.removePlayer(player);
        }); //

      }); //

    }); //

  }); //

}; //
