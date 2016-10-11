'use strict';

let app, admin, http, io;

app = require('express')();

admin = require('sriracha');

http = require('http').Server(app);

io = require('socket.io')(http);

let postal = require('postal');
let events = postal.channel();

let bodyParser = require('body-parser');
let session = require('express-session');

app.engine('ejs', require('ejs-locals'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'keyboard cat'
}));

let User = require(__dirname + '/game/mongo')(app, events);
require(__dirname + '/game/client-interact')(io, User);

app.get('/', (req, res) => {
  if (req.session.user && req.session.user.username) res.render(__dirname + '/views/dashboard.ejs', {
    user: req.session.user
  });
  else res.render(__dirname + '/views/index.ejs');
});
app.get('/logout', (req, res) => {
  if (req.session.user) {
    console.log(req.session.user.username + ' has logged out!');
    delete req.session.user;
  }
  res.redirect('/login');
});
app.get('/login', (req, res) => {
  res.render(__dirname + '/views/login.ejs');
});
app.get('/register', (req, res) => {
  res.render(__dirname + '/views/register.ejs');
});
app.get('/play', (req, res) => {
  if (req.session.user && req.session.user.username) res.render(__dirname + '/views/play.ejs', {
    user: req.session.user
  });
  else res.redirect('/login');
});
app.get('/robots', (req, res) => {
  res.render(__dirname + 'views/robots.ejs');
});
app.get('/LICENSE', (req, res) => {
  res.render(__dirname + '/LICENSE');
});
app.use('/admin', admin({
  username: 'admin',
  password: '201703502'
}));

app.use(require('express')['static']('public'));

http.listen(process.env.PORT || 8080, function (listening) {
  console.log('listening for connections on 0.0.0.0\nLicense: The Grove is copyright 2016 by Hybrid Alpaca Game Studios. All images, story, and game are copyright of Hybrid Alapca Game Studios. Copying or redistributing this game or content without the consent of Hybrid Alpaca Game Studios is illegal and unlawful.  The Grove is copyright 2016 by Artifex Game Studios. All images, story, and game are copyright of Artifex Game Studios. Copying or redistributing this game or content without the consent of Artifex Game Studios is illegal and unlawful. ');
});