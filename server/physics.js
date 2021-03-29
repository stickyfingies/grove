export default (socket) => {
    socket.on('bullet', bodyData => {
        socket.broadcast.emit('bullet', bodyData);
    });
    socket.on('hit-player', id => {
        socket.broadcast.emit('hit', {
            id,
            dmg: 1
        });
    });
};