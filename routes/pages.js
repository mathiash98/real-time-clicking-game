    const app = require('express').Router();

// required models 
const Crime = require('../models/crime');
const Weapon = require("../models/weapon");
const City = require('../models/city');
const User = require("../models/user");
const Armor = require("../models/armor");
// const OrganizedCrime = require("../models/organizedcrime");
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
      return next();
    }
    res.status(401).redirect('/login');
  }
  
function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            return next();
        } else {
            res.status(401).redirect('/login');
        }
    }

    res.status(401).redirect('/login');
}


app.get('/', function (req, res) {
   res.render('index'); 
});

app.get('/crime', isLoggedIn, function (req, res) {
    Crime.find({'_city': req.user._city})
    .sort({'difficulty': 1})
    .exec(function (err, crimes) {
        res.render('crime', {'crimes': crimes});
    });
});

app.get("/organizedcrime",isLoggedIn, function (req, res) {
    OrganizedCrime.find({"_city":req.user._city})
    .sort({"difficulty": 1})
    .exec(function (err, organizedcrimes) {
        res.render("organizedcrime", {"OrganizedCrimes": organizedcrimes});
    });
});

app.get("/weaponstore",isLoggedIn, function (req, res) {
    Weapon.find(function (err,weapons) {
        Armor.find(function (err, armors) {
            res.render("weaponstore",{"weapons": weapons, "armors": armors});
        });
    }); 
});

app.get("/profile",isLoggedIn, function (req, res ) {
    User.find(function (err,users) {
        res.render("profile", {"users": users});
    }); 
});

app.get('/city', isLoggedIn, function (req, res) {
    City.find()
    .sort({'difficulty': 1})
    .exec(function (err, cities) {
        res.render('city', {'cities': cities});
    });
});

app.get('/travel', isLoggedIn, function (req, res) {
    City.find()
    .sort({'difficulty': 1})
    .exec(function (err, cities) {
        res.render('travel', {'cities': cities});
    });
});

app.get(['/admin', '/admin/:adminpage'], isAdmin, function (req, res) {
    res.render('admin');
});

app.get('/favicon.ico', function(req, res){/*code*/});

app.get('/:pagename', function (req, res) {
    // console.log('Someone wants to render', req.params.pagename);
    res.render(req.params.pagename);
});

module.exports = app;