const express = require('express');
const passport = require('passport');

const router = express.Router();

module.exports = function (app) {
    require('./authStrategy')(passport);
    app.use(passport.initialize());
    app.use(passport.session());
    // Always pass the user object to the vieweninge
    app.use(function(req, res, next) {
        res.locals.user = req.user;
        next();
    });
    app.use(function (req, res, next) {
       res.locals.user = req.user;
       next();
    });
    app.use(function (req, res, next) {
        console.log(req.ip, req.user);
        next();
    });

    // Let router handle all movements from now on
    app.use('/', router);

    // Different subroutes
    router.use('/auth', require('./auth'));
    router.use('/api', require('./api'));
    router.use('/', require('./pages'));
}
