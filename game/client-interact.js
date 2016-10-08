'use strict';
var players = require('../game/players');

module.exports = (io, User) => {
  io.on('connection', socket => {
    socket.on('client-credentials', creds => {
      User.findOne({
        username: creds.username,
        password: creds.password
      }, (err, o) => {
        if (err) console.err(err);
        if (!o) console.error('USER NOT FOUND FOR MULTIPLAYER');
        players.addPlayer(socket.id, o);
        let player = players.playerForId(socket.id);
        socket.emit('createPlayer', player);
        socket.broadcast.emit('addOtherPlayer', player);
        socket.on('requestOldPlayers', function () {
          for (let i = 0; i < players.players.length; i++) {
            if (players.players[i].playerId != socket.id)
              socket.emit('addOtherPlayer', players.players[i]);
          }
        });
        socket.on('updatePosition', data => {
          let newData = players.updatePlayerData(data);
          socket.broadcast.emit('updatePosition', newData);
        });

        socket.on('inventory-update', dat => {
          User.findOne({
            username: dat.user.username,
            password: dat.user.password
          }, (err, obj) => {
            if (err) console.log('ERROR!');
            if (obj) {
              obj.inventory = dat.inv;
              obj.save();
            }
            else console.log('Credentials not valid!');
          });
        });
        socket.on('map-update', dat => {
          User.findOne({
            username: dat.user.username,
            password: dat.user.password
          }, (err, obj) => {
            if (err) console.log('ERROR!');
            if (obj) {
              obj.map = dat.map;
              obj.save();
              socket.emit('reload bitch!', true);
            }
            else console.log('Credentials not valid!');
          });
        });

        socket.on('chat message', msg => {
          console.log('message: ' + msg);
          io.emit('chat message', msg);
        });

        socket.on('disconnect', function () {
          console.log('A player has logged off.');
          io.emit('removeOtherPlayer', player);
          players.removePlayer(player);
        }); //
      }); //
    }); //
  }); //
}; //