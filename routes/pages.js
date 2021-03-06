    const app = require('express').Router();

// required models 
const Crime = require('../models/crime');
const Weapon = require("../models/weapon");
const City = require('../models/city');
const User = require("../models/user");
const Armor = require("../models/armor");
const Car = require("../models/car");
const Mission = require("../models/mission");
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
        res.render('crime', {'crimes': crimes, user: req.user});
    });
});

app.get("/mission", isLoggedIn, function (req, res) {
    Mission.find({"_city": req.user._city})
    .sort({"level": 1})
    .exec(function (err, data) {
        res.render("mission", {"missions": data});
    });
});

app.get("/store", isLoggedIn, function (req, res) {
    Weapon.find(function (err, weapons) {
        Armor.find(function (err, armors) {
            Car.find(function (err, cars) {
                res.render("store", {"weapons": weapons, "armors": armors, 'cars': cars});
            });
        });
    }); 
});

app.get("/profile", isLoggedIn, function (req, res ) {
    User.find(function (err,users) {
        res.render("profile", {"users": users});
    }); 
});

app.get("/bank", isLoggedIn, function (req, res) {
    User.find(function(err, users) {
        res.render("bank", {"users": users})
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