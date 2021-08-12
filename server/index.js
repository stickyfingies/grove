//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---"\___
//                  ." \\|     |// ".
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ""\---/""  |_/ |
//               \  .-\__  "-"  ___/-. /
//             ___". ."  /--.--\  `. ."___
//          ."" "<  `.___\_<|>_/___." >" "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-"=====
//                       `=---="
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               Buddha bless the code
//

import HTTP from 'http';
import { Server as IOServer } from 'socket.io';
import compression from 'compression';
import ejs from 'ejs-locals';
import express from 'express';
import path from 'path';
import session from 'express-session';

// eslint-disable-next-line import/extensions
import { dbFindUser, dbInit, dbNewUser } from './mongo.js';
// eslint-disable-next-line import/extensions
import _client from './client-interact.js';

const app = express();
const http = HTTP.Server(app);
const io = new IOServer(http);

///

app.engine('ejs', ejs);

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));
app.use(session({
    secret: '434dbc979dde137b5a2a5a4916464fecc8f7997f0caebd19e6e5d48b622a896b', // is a cookie
    name: 'grove_usersession',
    secure: true,
    resave: true,
    saveUninitialized: false,
}));
app.use(compression());

///

dbInit();
_client(io);

///

app.use(express.static('dist', {
    setHeaders(res) {
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
    },
}));

app.use('/modules', express.static('node_modules'));

app.get('/', (req, res) => {
    const { session: { user } } = req;
    if (user && user.username) {
        res.render(path.resolve('views/dashboard.ejs'), { user });
    } else {
        res.render(path.resolve('views/index.ejs'));
    }
});

app.get('/logout', (req, res) => {
    const { session: { user } } = req;
    if (user) {
        console.log(`[${user.username}] logged out`);
        delete req.session.user;
    }
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render(path.resolve('views/login.ejs'));
});

app.get('/register', (req, res) => {
    res.render(path.resolve('views/register.ejs'));
});

app.get('/play', (req, res) => {
    const { session: { user } } = req;
    if (user && user.username) {
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.sendFile(path.resolve('views/play.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.resolve('views/robots.txt'));
});

app.get('/settings', (req, res) => {
    res.render(path.resolve('views/settings.ejs'));
});

///

app.post('/login', async (req, res) => {
    const user = await dbFindUser(req.body);
    if (user) {
        console.log(`[${user.username}] logged in`);
        req.session.user = user;
        res.redirect('/');
    } else {
        res.redirect('/login?err=user_not_found');
    }
});

app.post('/register', async (req, res) => {
    const user = await dbNewUser(req.body);
    if (user) {
        console.log(`[${user.username}] made an account`);
        req.session.user = user;
        res.redirect('/');
    } else {
        res.redirect('/register?err=birds_ate_the_server');
    }
});

///

const port = process.env.PORT ?? 80;
http.listen(port, () => {
    console.log(`NodeJS server listening For conections on localhost:${port}`);
});
