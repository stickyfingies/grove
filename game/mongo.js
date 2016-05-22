module.exports = function (app) {
    var mongoose = require('mongoose');

    var db = mongoose.connection;
    var User = mongoose.model('User', {
        username: String,
        password: String
    });
    db.on('error', console.error);
    db.once('open', function () {
        console.log('Successfully connected to MongoDB!');
    });

    mongoose.connect('mongodb://0.0.0.0/db_main');
    app.post('/ACCOUNT_DB_DATA', function (req, res) {
        User.findOne({
            username: req.body.username,
            password: req.body.password
        }, function (err, obj) {
            if (err) {
                console.log(err);
            }
            else if (obj) {
                console.log('Found:', obj);
                res.redirect('/play');
            }
            else {
                console.log('User not found!');
                res.send('no.');
            }
        });
    });
};