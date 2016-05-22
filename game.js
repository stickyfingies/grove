var _exp = module.exports = function() {
    this.players = [];
    this.player = function(socket) {
        this.timestamp = Date.now();
        this.position = {
            x: 0,
            y: 0
        };
        this.socket = socket;
    };
};