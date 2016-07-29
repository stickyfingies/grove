module.exports = function (app, events) {
    var mongoose = require('mongoose');
    var db = mongoose.connection;
    var User = mongoose.model('User', {
        username: String,
        password: String,
        class: String,
        race: String,
        inventory: [],
        map: String
    });
    db.on('error', console.error);
    db.once('open', function () {
        console.log('Successfully connected to MongoDB!');
    });
    mongoose.connect('mongodb://0.0.0.0/db_main');

    events.subscribe('inventory', function (dat) {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, function (err, obj) {
            if (err) console.log(err);
            if (obj) {
                obj.inventory = dat.inv;
                obj.save();
                events.publish('done', {
                    o: obj
                });
            }
            else console.log('Credentials not valid!');
        });
    });
    events.subscribe('map', function (dat) {
        User.findOne({
            username: dat.user.username,
            password: dat.user.password
        }, function (err, obj) {
            if (err) console.log(err);
            if (obj) {
                obj.map = dat.map;
                obj.save(function (err, data) {
                    events.publish('done', {
                        o: data
                    });
                });
            }
            else console.log('Credentials not valid!');
        });
    });
    app.post('/ACCOUNT_DB_DATA', function (req, res) {
        if (req.body.type == 'login') {
            User.findOne({
                username: req.body.username,
                password: req.body.password
            }, function (err, obj) {
                if (err) {
                    console.log(err);
                }
                else if (obj) {
                    console.log(obj.username + ' logged in');
                    res.redirect(307, '/dashboard');
                    events.publish('pageview', {
                        page: '/dashboard',
                        data: obj
                    });
                }
                else {
                    console.log('User not found!');
                    res.redirect('/login?err=not_found');
                }
            });
        }
        if (req.body.type == 'register') {
            var u = new User({
                username: req.body.username,
                password: req.body.password,
                class: req.body.class,
                race: req.body.race,
                map: 'tutorial'
            });
            u.save(function (err, dat) {
                if (err) console.log(err);
                else {
                    console.log(dat.username + ' created an account.');
                    res.redirect('/login');
                }
            });
        }
        if (req.body.type == 'dashboard') {
            User.findOne({
                username: req.body.username,
                password: req.body.password
            }, function (err, obj) {
                if (err) {
                    console.log(err);
                }
                else if (obj) {
                    res.redirect(307, '/play');
                    events.publish('pageview', {
                        page: '/play',
                        data: obj
                    });
                }
                else {
                    console.log('User not found!');
                    res.redirect('/login?err=not_found');
                }
            });
        }
    });
};