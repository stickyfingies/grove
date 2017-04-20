module.exports = (socket, io) => {
    socket.on('bullet', (bodyData) => {
        socket.broadcast.emit('bullet', bodyData);
    });
    socket.on('hit-player', (id) => {
        socket.broadcast.emit('hit', {
            id,
            dmg: 1
        });
    });
};
console.log(new Date() + "Physics Started.");