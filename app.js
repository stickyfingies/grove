var app, http, io;

app = require('express')();

http = require('http').Server(app);

io = require('socket.io')(http);

var postal = require('postal');
var events = postal.channel();

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/views/login.html');
});
app.get('/register', function (req, res) {
  res.sendFile(__dirname + '/views/register.html');
});
app.post('/play', function (req, res) {
  res.sendFile(__dirname + '/views/play.html');
});
app.get('/play', function (req, res) {
  res.redirect('/login');
});
app.post('/dashboard', function (req, res) {
  res.sendFile(__dirname + '/views/dashboard.html');
});

app.use(require('express')["static"]('public'));

require(__dirname + '/game/client-interact')(io, events);
require(__dirname + '/game/mongo')(app, events);

// var exec = require('child_process').exec;
// function puts(error, stdout, stderr) { console.log(stdout) }
// exec("./mongod", puts);

http.listen(8080, function () {
  console.log('listening on *:8080');
});