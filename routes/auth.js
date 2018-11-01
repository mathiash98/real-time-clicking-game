const app = require('express').Router();
const passport = require('passport');


app.post('/local-login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));
app.post('/local-register', passport.authenticate('local-register', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

module.exports = app;