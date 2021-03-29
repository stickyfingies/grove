"use strict";

import mongoose from "mongoose";
import md5 from "md5";

const db = mongoose.connection;

const User = mongoose.model("User", {
    username: String,
    password: String,
    map: String,
    email: String,
    quest: String,
});

export const dbInit = (events) => {
    db.on("error", console.error);
    db.once("open", () => console.log("Successfully connected to MongoDB!"));

    const uri = "mongodb+srv://admin:admin@cluster0.vc0nb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    events.subscribe("inventory", dat => {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, (err, obj) => {
            if (err)
                console.log("DB Error [inventory event]: " + err);
            if (obj) {
                obj.inventory = dat.inv;
                obj.save((err, data) => {
                    if (err) console.error(err);
                    events.publish("done", { o: data });
                });
            }
        });
    });

    events.subscribe("map", dat => {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, (err, obj) => {
            if (err)
                console.log("DB Error [map event]: " + err);
            if (obj) {
                obj.map = dat.map;
                obj.save((err, data) => {
                    events.publish("done", {
                        o: data
                    });
                });
            }
        });
    });
};

export const dbFindUser = async ({username, password}) => {
    return User.findOne({ username, password: md5(password) }).exec();
};

export const dbNewUser = async ({username, password, race}) => {
    let u = new User({
        username,
        password: md5(password),
        race,
        inventory: [],
        map: "skjar-isles",
        level: 1,
        status: "u." + Date.now()
    });
    return u.save();
};
