'use strict';
module.exports = (app, events) => {
    let mongoose = require('mongoose');
    let db = mongoose.connection;
    let User = mongoose.model('User', {
        username: String,
        password: String,
        class: String,
        race: String,
        inventory: [],
        map: String,
        level: Number
    });
    db.on('error', console.error);
    db.once('open', function () {
        console.log('Successfully connected to MongoDB');
    });
    mongoose.connect('mongodb://hybridalpaca:cellman123@ds139685.mlab.com:39685/grove');

    events.subscribe('inventory', dat => {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, (err, obj) => {
            if (err) console.log('ERROR!');
            if (obj) {
                obj.inventory = dat.inv;
                obj.save((err, data) => {
                    if (err) console.error(err);
                    req.session.user = obj;
                    events.publish('done', {
                        o: data
                    });
                });
            }
            else console.log('Credentials not valid!');
        });
    });
    events.subscribe('map', dat => {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, (err, obj) => {
            if (err) console.log('ERROR!');
            if (obj) {
                obj.map = dat.map;
                obj.save((err, data) => {
                    events.publish('done', {
                        o: data
                    });
                });
            }
            else console.log('Credentials not valid!');
        });
    });

    ////////////////////////////////////////////////////

    app.post('/login', (req, res) => {
        User.findOne({
            username: req.body.username,
            password: require('md5')(req.body.password)
        }, (err, obj) => {
            if (err) {
                console.log(err);
            }
            else if (obj) {
                console.log(obj.username + ' logged on.');
                req.session.user = obj;
                res.redirect('/');
                events.publish('pageview', {
                    page: '/dashboard',
                    data: obj
                });
            }
            else {
                res.redirect('/login?err=not_found');
            }
        });
    });
    app.post('/register', (req, res) => {
        let u = new User({
            username: req.body.username,
            password: require('md5')(req.body.password),
            class: req.body.class,
            race: req.body.race,
            map: 'tutorial',
            level: 1
        });
        u.save((err, obj) => {
            if (err) console.error('ERROR!');
            else if (obj) {
                console.log(obj.username + ' created an account.');
                req.session.user = obj;
                res.redirect('/');
            }
        });
    });
    return User;
};