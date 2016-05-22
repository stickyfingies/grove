var maps = require('../game/maps');

module.exports = function(io) {
  io.on('connection', function(socket) {
    socket.emit('genMap', maps['tutorial']);
    console.log('A user connected.  Logging time at: ' + new Date());
  });
};