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

let User = require(__dirname + '/mongo')(app, events);
require(__dirname + '/client-interact')(io, User);

app.get('/', (req, res) => {
  if (req.session.user && req.session.user.username) res.render('../views/dashboard.ejs', {
    user: req.session.user
  });
  else res.render('../views/index.ejs');
});
app.get('/logout', (req, res) => {
  if (req.session.user) {
    console.log(req.session.user.username + ' has logged out!\n\n');
    delete req.session.user;
  }
  res.redirect('/');
});
app.get('/login', (req, res) => {
  res.render('../views/login.ejs');
});
app.get('/register', (req, res) => {
  res.render('../views/register.ejs');
});
app.get('/play', (req, res) => {
  if (req.session.user && req.session.user.username) res.render('../views/play.ejs', {
    user: req.session.user
  });
  else res.redirect('/login');
});
app.use('/robots.txt', (req, res) => {
  res.sendFile(require('path').resolve('views/robots.txt'));
});
app.get('/license', (req, res) => {
  res.sendFile(require('path').resolve('views/LICENSE.txt'));
});


app.use('/admin', admin({
  username: 'admin',
  password: '201703502'
}));

app.use(require('express')['static']('public'));

http.listen(process.env.PORT || 8080, function (listening) {
  console.log('\n\n\n\nlistening for connections on 0.0.0.0\n\n\n\n\nLicense: The Grove is copyright 2016 by Hybrid Alpaca Game Studios. All images, story, and game are copyright of \n Hybrid Alapca Game Studios. Copying or redistributing this game or content without the consent of \n Hybrid Alpaca Game Studios is illegal and unlawful.  The Grove is copyright 2016 by Artifex Game Studios. \n All images, story, and game are copyright of Artifex Game Studios. Copying or redistributing this game or content without the consent of Artifex Game Studios is illegal and unlawful. \n     \n     \n      \n       ');
});