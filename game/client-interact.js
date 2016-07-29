var maps = require('../game/maps');
var players = require('../game/players');

module.exports = function (io, events) {
  var o;
  events.subscribe('pageview', function (data) {
    o = data.data;
  });

  io.on('connection', function (socket) {

    players.addPlayer(socket.id, o);
    var player = players.playerForId(socket.id);
    socket.emit('createPlayer', player);
    socket.broadcast.emit('addOtherPlayer', player);
    socket.on('requestOldPlayers', function () {
      for (var i = 0; i < players.players.length; i++) {
        if (players.players[i].playerId != socket.id)
          socket.emit('addOtherPlayer', players.players[i]);
      }
    });
    socket.on('updatePosition', function (data) {
      var newData = players.updatePlayerData(data);
      socket.broadcast.emit('updatePosition', newData);
    });
    // socket.emit('data-update', o);

    socket.on('inventory-update', function (dat) {
      events.publish('inventory', dat);
    });
    socket.on('map-update', function (dat) {
      var done = events.subscribe('done', function (svreck) {
        o = svreck.o;
        socket.emit('clear');
        socket.emit('data-update', svreck.o);
        socket.emit('genMap', maps[svreck.o.map]);
        socket.emit('reload bitch!');
        done.unsubscribe();
      });
      events.publish('map', dat);
    });

    socket.emit('genMap', maps[o.map]);
    console.log('A user connected.  Logging time at: ' + new Date());
    socket.on('chat message', function (msg) {
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    });

    socket.on('disconnect', function () {
      console.log('user disconnected');
      io.emit('removeOtherPlayer', player);
      players.removePlayer(player);
    });
  });

};