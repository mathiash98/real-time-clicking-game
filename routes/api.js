api = require('express').Router();

// Models
var User = require('../models/user');
const Category = require('../models/category');
const Item = require('../models/item');
const City = require('../models/city');
const Crime = require('../models/crime');

function isLoggedInJson(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.status(401).send();
}

function isAdminJson(req, res, next) {
    if(req.isAuthenticated()) {
        if (req.user.admin){
            return next();
        }
    }
    res.status(401).send();
}

api.get('/test', function (req, res) {
   res.send('test'); 
});

// ==================================================================================
// ===========================     PLAYER API STUFF    ==============================
// ==================================================================================

api.get('/player', function (req, res) {
    User.find()
    .select('username admin level money')
    .sort({level: -1})
    .exec(function (err, data) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.json(data)
       }
    });
});

api.get('/player/:username', function (req, res) {
    User.findOne({'username': req.params.username})
    .select('username admin level money')
    .exec(function (err, data) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.json(data)
       }
    });
});

api.put('/player/:username', isLoggedInJson, function (req, res) {
    console.log(req.body);
    if (req.user.admin || req.user.username == req.params.username){
        User.findOne({'username': req.params.username})
        .exec(function(err, user) {
            if (err){
                res.status(500).send(err);
            } else {
                if(req.user.admin) {
                    if (req.body.money) user.money = req.body.money;
                    if (req.body.level) user.level = req.body.level;
                } else if (req.user.username == req.params.username){
                    // Add items to edit on user, currently have nothing to change
                }
                user.save(function (err, updatedUser) {
                    if (err) {
                        res.status(500).send(err);
                    } 
                    res.json('User updated');
                });
            }
        });
    } else {
        res.status(401).send('You are not allowed to edit this user');
    }
});

// ==================================================================================
// ===========================     ITEM API STUFF    ================================
// ==================================================================================
api.get('/item', function (req, res) {
    User.find()
    .sort({level: -1})
    .exec(function (err, data) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.json(data)
       }
    });
});

api.get('/item/:itemid', function (req, res) {
    User.findById(req.params.itemid)
    .exec(function (err, data) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.json(data)
       }
    });
});

// ==================================================================================
// ===========================     CATEGORY API STUFF    ============================
// ==================================================================================
api.get('/category', function (req, res) {
    Category.find()
    .exec(function (err, data) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.json(data)
       }
    });
});

api.post('/category', isAdminJson, function (req, res) {
    console.log('got request');
    var newCategory = new Category();
    if(req.body.name){
        newCategory.name = req.body.name;
        
        newCategory.save(function (err, data) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                res.json(data)
            } 
        });
    } else {
        res.status(400).send('You need a name for the category');
    }
});

// ==================================================================================
// ===========================     City API STUFF    ================================
// ==================================================================================

api.get('/city', function (req, res) {
   City.find()
   .sort({level: 1})
   .exec(function (err, data) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        res.json(data)
    } 
   }); 
});

api.post('/city', isAdminJson, function (req, res) {
   let newCity = new City();
   newCity.name = req.body.name;
   if(req.body.description){
       newCity.description = req.body.description;
    }
   if(req.body.level){
       newCity.level = req.body.level;
   }
   
   newCity.save(function (err, data) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        res.json(data)
    } 
   });
});

api.put(['/city/:cityid/:cityname', '/city/:cityid'], isAdminJson, function (req, res) {
    City.findByIdAndUpdate(req.params.cityid, req.body, function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(data)
        }  
    });
});

api.delete(['/city/:cityid/:cityname', '/city/:cityid'], isAdminJson, function (req, res) {
    // Deleting a city is very dangerous and will break a lot of stuff, so we need some advanced stuff here
    // Has to either delete all items in the city or move them to somewhere safe or whatever
});

// ==================================================================================
// ===========================     Crime API STUFF    ===============================
// ==================================================================================

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

api.get('/crime', isLoggedInJson, function (req, res) {
    Crime.find({'_city': req.user._city})
    .sort({'level': 1})
    .exec(function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(data)
        } 
    });
});

api.post('/crime', isAdminJson, function (req, res) {
   let newCrime = new Crime(req.body);
   
   newCrime.save(function (err, crime) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        res.json(crime)
    }  
   });
});

api.get('/crime/:crimeid', isLoggedInJson, function (req, res) {
    Crime.findOne({'_id': req.params.crimeid, '_city': req.user._city})
    .exec(function (err, crime) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(crime)
        } 
    });
});

api.post('/crime/:crimeid/perform', isLoggedInJson, function (req, res) {
    Crime.findOne({'_id': req.params.crimeid, '_city': req.user._city})
    .exec(function (err, crime) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if (req.user.level < crime.level) {
                res.status(400).json({
                    'success': false,
                    'msg': 'You need to be level: ' + crime.level + ' to perform this crime!'
                });
            } else {
                // Do some algorith stuff to calculate if you succed
                console.log(req.user);
                console.log('User.level ' + req.user.level);
                console.log(req.user.username + ' is doing crime: ' + crime.name + '. Will it succed with these params? ' + req.user.level + ' - ' + crime.level + ' - ' + getRandomInt(req.user.level, crime.difficulty));
                if (getRandomInt(req.user.level, crime.difficulty) > 6) {
                    let payout = getRandomInt(crime.minPayout, crime.maxPayout);
                    req.user.money += payout;
                    req.user.save(function (err, updatedUser) {
                       if(err) {
                           res.status(500).send(err);
                       } else {
                            // Return an appropiate message
                            // etc: you stole a fresh piece of meat and sold it to a hobo for payout 
                           res.json({
                               success: true,
                               msg: 'You stole a fresh piece of meat and sold it to a hobo for ' + payout + ' money.'
                           })
                       }
                    });
                } else {
                    // Need some algorith to check if user goes to jail
                    res.json({
                        success: false,
                        msg: 'You tripped on the way out, got scared and ran away without the goods.'
                    });
                }
            }
        } 
    });
});

module.exports = api;