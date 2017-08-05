//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               Buddha bless the code
//

'use strict';

let app, compression, helmet, http, io;

app = require('express')();

http = require('http').Server(app);

helmet = require('helmet');

io = require('socket.io')(http);

compression = require('compression');

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
  secret: '434dbc979dde137b5a2a5a4916464fecc8f7997f0caebd19e6e5d48b622a896b', // is a cookie
  name: 'TG_USR_SESSION',
  secure: false
}));
app.use(compression());
app.use(helmet());

app.use(require('express')['static']('public'));
const User = require(__dirname + '/mongo')(app, events);
require(__dirname + '/client-interact')(io, User);

app.get('/', (req, res) => {
  if (req.session.user && req.session.user.username) res.render('../views/dashboard.ejs', {
    user: req.session.user
  });
  else res.render('../views/index.ejs');
  console.log(new Date() + 'Home Activated.');
});
app.get('/logout', (req, res) => {
  if (req.session.user) {
    console.log(new Date() + req.session.user.username + ' has logged out. ');
    delete req.session.user;
  }
  res.redirect('/');
});
app.get('/login', (req, res) => {
  res.render('../views/login.ejs');
  console.log(new Date() + 'Login Activated.');

});
app.get('/register', (req, res) => {
  res.render('../views/register.ejs');
  console.log(new Date() + 'Register Activated.');
});
app.get('/play', (req, res) => {
  console.log(new Date() + 'Play Activated.');
  if (req.session.user && req.session.user.username) res.render('../views/play.ejs', {
    user: req.session.user
  });
  else res.redirect('/login');
});
app.get('/robots.txt', (req, res) => {
  res.sendFile(require('path').resolve('views/robots.txt'));
  console.log(new Date() + 'Robots Activated.');
});
app.get('/settings', (req, res) => {
  res.render(require('path').resolve('views/settings.ejs'));
  console.log(new Date() + 'Settings Activated.');
});
app.get('/pwreset', (req, res) => {
  res.render(require('path').resolve('views/pwreset.ejs'));
  console.log(new Date() + 'Password Reset Activated.');
});
app.get('/login-weebly', (req, res) => {
  res.render(require('path').resolve('views/login-iframe.ejs'));
  console.log(new Date() + 'Weebly login Activated.');
});
http.listen(process.env.PORT || 8080, (listening) => {
  if (!process.env.NODE_ENV) {
    console.log('Listening For conections on 0.0.0.0');
    console.log('Server running! ( View license at https://grove-mmo.com )');
  }
});
