var app, http, io;

app = require('express')();

http = require('http').Server(app);

io = require('socket.io')(http);

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/login', function(req, res) {
  res.sendFile(__dirname + '/views/login.html');
});
app.get('/play', function(req, res) {
  res.sendFile(__dirname + '/views/play.html');
});

app.use(require('express')["static"]('public'));

require(__dirname + '/game/client-interact')(io);
require(__dirname + '/game/mongo')(app);

http.listen(8080, function() {
  console.log('listening on *:8080');
});