'use strict';
module.exports = (app, events) => {
    let mongoose = require('mongoose');
    let db = mongoose.connection;
    let User = mongoose.model('User', {
        username: String,
        password: String,
        map: String,
        email: String,
        quest: String,
    });

    db.on('error', console.error);
    db.once('open', () => {
        console.log(new Date() + `Successfully connected to MongoDB`);
    });
    mongoose.connect('mongodb://hybridalpaca:cellman123@ds139685.mlab.com:39685/grove');

    events.subscribe('inventory', dat => {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, (err, obj) => {
            if (err) console.log(new Date() + 'ERROR!');
            if (obj) {
                obj.inventory = dat.inv;
                obj.save((err, data) => {
                    if (err) console.error(err);
                    events.publish('done', {
                        o: data
                    });
                });
            }
            else console.log(new Date() + 'Credentials not valid!');
        });
    });
    events.subscribe('map', dat => {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, (err, obj) => {
            if (err) console.log(new Date() + 'ERROR!');
            if (obj) {
                obj.map = dat.map;
                obj.save((err, data) => {
                    events.publish('done', {
                        o: data
                    });
                });
            }
            else console.log(new Date() + 'Credentials not valid!');
        });
    });

    ////////////////////////////////////////////////////

    app.post('/login', (req, res) => {
        User.findOne({
            username: req.body.username,
            password: require('md5')(req.body.password)
        }, (err, obj) => {
            if (err) console.error(err);
            else if (obj) {
                console.log(new Date() + obj.username + ' has logged in.');
                req.session.user = obj;
                res.redirect('/');
                events.publish('pageview', {
                    page: '/dashboard',
                    data: obj
                });
            }
            else {
                res.redirect('/login?err=user_not_found');
            }
        });
    });
    app.post('/register', (req, res) => {
        let u = new User({
            username: req.body.username,
            password: require('md5')(req.body.password),
            class: req.body.class,
            race: req.body.race,
            inventory: [],
            map: 'skjar-isles',
            level: 1,
            status: 'u.' + Date.now()
        });
        u.save((err, obj) => {
            if (err) console.error(err);
            else if (obj) {
                console.log(new Date() + obj.username + ' has created an account.');
                req.session.user = obj;
                res.redirect('/');
            }
            else throw new Error(new Date() + 'Something (bad) happened!');
        });
    });
    app.post('/pwreset', (req, res) => {
        User.findOne({
            username: req.body.username,
            password: require('md5')(req.body.password)
        }, (err, doc) => {
            if (err) res.redirect('/');
            doc.password = require('md5')(req.body.new);
            doc.save();
            res.redirect('/');
        });
    });
    return User;
};
