// Attempt on creating script which will initalize the database with an admin user and some "fake" game data

const request = require("request");
const async = require('async');
const mongoose = require('mongoose');
const config = require('./config');
// Connect to mongodb
mongoose.connect(config.mongodb.uri, { useNewUrlParser: true }, function (err) {
    if(err) {throw err;}
    console.log('Connected to mongodb');
});

let adminUser = 'admin';
let adminPass = 'admin';

async.series({
    register: function (cb) {
        const User = require('./models/user');
        let user = new User({
            'username': 'admin',
            'local_login': {
                password: 'admin'
            },
            'admin': true
        }, false)
        user.save(function (err, data) {
            if (err) {
                throw err;
            } else {
                cb(null, data);
            }
        });
    },
    login: function (cb) {
        let options = { method: 'POST',
        url: 'http://localhost:8000/auth/local-login',
        headers: 
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: { username: 'admin', password: 'admin' } };

        request(options, function (error, response, body) {
            if (error) {
                cb(error, null);
            }
            console.log(response)
            cb(null, body);
        });
    },

}, function () {
    
});

