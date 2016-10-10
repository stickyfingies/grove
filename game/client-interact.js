'use strict';
var players = require('../game/players');

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
        if (!o) console.error('USER NOT FOUND FOR MULTIPLAYER');

        // add the new player to list of players
        players.addPlayer(socket.id, o);
        // get player we just made
        let player = players.playerForId(socket.id);

        // tell this client to create a new player
        socket.emit('createPlayer', player);
        // tell other clients we just made a player
        socket.broadcast.emit('addOtherPlayer', player);

        // when client asks for players that were there before they joined
        socket.on('requestOldPlayers', function () {
          for (let i = 0; i < players.players.length; i++) {
            if (players.players[i].playerId != socket.id)
              socket.emit('addOtherPlayer', players.players[i]);
          }
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
            if (err) console.log('ERROR!');
            if (obj) {
              obj.inventory = dat.inv;
              obj.save();
            }
            else console.log('Credentials not valid!');
          });
        });

        // client changed maps
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

        //////////////////////////////////////////////////

        // chat handler
        socket.on('chat message', msg => {
          console.log('message: ' + msg);
          io.emit('chat message', msg);
        });

        // client left :(
        socket.on('disconnect', function () {
          console.log('A player has logged off.');
          io.emit('removeOtherPlayer', player);
          players.removePlayer(player);
        }); //
        
      }); //
      
    }); //
    
  }); //
  
}; //