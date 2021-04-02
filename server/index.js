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

"use strict";

import express from "express";
import HTTP from "http";
import path from "path";
import { Server as ioServer } from "socket.io";
import compression from "compression";
import postal from "postal";
import bodyParser from "body-parser";
import session from "express-session";
import ejs from "ejs-locals";

import { dbInit, dbFindUser, dbNewUser } from "./mongo.js";
import _client from "./client-interact.js";

let app = express();
let http = HTTP.Server(app);
let io = new ioServer(http);
let events = postal.channel();

///

app.engine("ejs", ejs);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "434dbc979dde137b5a2a5a4916464fecc8f7997f0caebd19e6e5d48b622a896b", // is a cookie
    name: "grove_usersession",
    secure: true,
    resave: true,
    saveUninitialized: false
}));
app.use(compression());
app.use(express.static("public", {
    setHeaders(res) {
        res.set("Cross-Origin-Embedder-Policy", "require-corp");
        res.set("Cross-Origin-Opener-Policy", "same-origin");
    }
}));

///

dbInit(events);
_client(io);

///

app.get("/", (req, res) => {
    let { session: { user } } = req;
    if (user && user.username)
        res.render(path.resolve("views/dashboard.ejs"), { user });
    else
        res.render(path.resolve("views/index.ejs"));
});

app.get("/logout", (req, res) => {
    let { session: { user } } = req;
    if (user) {
        console.log(`[${user.username}] logged out`)
        delete req.session.user;
    }
    res.redirect("/");
});

app.get("/login", (req, res) => {
    res.render(path.resolve("views/login.ejs"));
});

app.get("/register", (req, res) => {
    res.render(path.resolve("views/register.ejs"));
});

app.get("/play", (req, res) => {
    let { session: { user } } = req;
    if (user && user.username) {
        res.set("Cross-Origin-Embedder-Policy", "require-corp");
        res.set("Cross-Origin-Opener-Policy", "same-origin");
        res.render(path.resolve("views/play.ejs"), { user });
    }
    else
        res.redirect("/login");
});

app.get("/robots.txt", (req, res) => {
    res.sendFile(path.resolve("views/robots.txt"));
});

app.get("/settings", (req, res) => {
    res.render(path.resolve("views/settings.ejs"));
});

///

app.post("/login", async (req, res) => {
    const user = await dbFindUser(req.body);
    if (user) {
        console.log(`[${user.username}] logged in`);
        req.session.user = user;
        res.redirect("/");
    }
    else
        res.redirect("/login?err=user_not_found");
});

app.post("/register", async (req, res) => {
    const user = await dbNewUser(req.body);
    if (user) {
        console.log(`[${user.username}] made an account`);
        req.session.user = user;
        res.redirect("/");
    }
    else
        res.redirect("/register?err=birds_ate_the_server");
});

///

http.listen(process.env.PORT || 8080, () => {
    console.log("Listening For conections on 0.0.0.0");
    console.log("Server running!");
});
