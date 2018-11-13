api = require('express').Router();

// Models
var User = require('../models/user');
const Category = require('../models/category');
const Item = require('../models/item');
const City = require('../models/city');
const Crime = require('../models/crime');
const Weapon = require("../models/weapon");

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
    let fields = ['username', 'admin', 'level', 'money'];
    if (req.user){
        if(req.user.admin){
            fields.concat(['_city', '_inventory', '_equipped', 'jail']);
        }
    }
    User.find()
    .select(fields)
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
// ===========================     Weapon API STUFF      ============================
// ==================================================================================

api.get("/weapon",function(req, res) {
    Weapon.find()
    .sort({level: 1})
    .exec(function(err,data) {
        if(err) {
            console.log(err);
            res.status(500).send(err);        
        } else {
            res.json(data)
        }
    });
});

api.post("/weapon", isAdminJson ,function(req, res) {
    console.log(req.body)
    let newWeapon = new Weapon();
    newWeapon.price = req.body.price;
    newWeapon.damage = req.body.damage;
    newWeapon.name = req.body.name;
    newWeapon.level = req.body.level;
    if(req.body.description){
        newWeapon.description = req.body.description;
    }
    newWeapon.save(function (err,data) {
    if (err) {
        console.log(err)
        res.status(500).send(err);
    } else {
        res.json(data)
    }
    });
});

api.get("/weapon/:weaponid", function (req,res) {
    Weapon.findById(req.params.weaponid)
    .exec(function (err, data) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

api.post("/weapon/:weaponid/purchase", isLoggedInJson, function (req,res) {
    Weapon.findById(req.params.weaponid)
    .exec(function (err, weapon){
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if (req.user.money < weapon.price) {
                res.json({
                    "success": false,
                    "msg": "You need to have a minimum of" + weapon.price + " to buy this weapon."
                });
            } else if (req.user.level < weapon.level) {
                res.json({
                    "success": false,
                    "msg": "You need to have a minimum level of " + weapon.level + " to buy this weapon."
                });
            } else {
                req.user.money -= weapon.price;
                console.log("Weapon id",weapon._id)
                console.log("Inventory",req.user._inventory._weapons)
                req.user._inventory._weapons.push(weapon)
                req.user.save(function (err, data) {
                    if(err) {
                        console.log(err)
                        res.status(500).send(err);
                    } else {
                        res.json({
                            "success": true,
                            "msg": "You have bougth " + weapon.name + "!" 
                        });
                    }
                });
            }

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
    /* get a list of all cities */
   City.find()
   .sort({level: 1})
   .exec(function (err, data) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        res.json(data);
    } 
   }); 
});

api.get('/city/:cityname', function (req, res) {
    /* Return specific city based on name */
   City.findOne({'name': req.params.cityname}, function (err, data) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        res.json(data);
    }
   }); 
});

api.get('/city/:cityname/travel', isLoggedInJson, function (req, res) {
    // Need some mechanics to check if player is allowed to travel
    // Travel cooldown
    // Prison or not?
    // Alive or not?
    // Hotel?
    // In hospital?
    // Check if any upcoming planned robberies which won't work if user isn't in city
    
    // Check if user already in city
    if (req.params.cityname == req.user._city) {
        res.status(400).json({
            success: false,
            msg: 'You are already in ' + req.params.cityname
        });
    } else {
        // Look up the city
        City.findOne({"name": req.params.cityname}, function (err, data) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                // Check if level is high enough
                if (req.user.level > data.level) {
                    // need to check if user has enough money to travel, but no checking atm
                    
                    // Updates user's _city and saves it
                    req.user._city = data.name;
                    req.user.save(function (err, updated_user) {
                        if (err) {
                            console.log(err);
                            res.status(500).send(err);
                        } else {
                            res.json({
                                success: true,
                                msg: 'You just traveled to ' + data.name + '.'
                            });
                        } 
                    });
                } else {
                    // Required level for city is higher than user's level
                    res.status(401).json({
                        success: false,
                        msg: 'You need to be level ' + data.level + ' to travel to ' + data.name + '.'
                    });
                }
            } 
        });
    }

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
    /* API endpoint for getting a list of crimes avaible in player's current city */
    let query = {};
    // if user is not admin, display only crimes in player's city
    if(!req.user.admin){
        query._city = req.user._city;
    }
    Crime.find(query)
    .sort({'level': 1}) // Sorts based on level from 0->
    .exec(function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(data);
        } 
    });
});

api.post('/crime', isAdminJson, function (req, res) {
    /* Posts a new crime, look in crime model to see properties */
    let newCrime = new Crime(req.body);
   
   newCrime.save(function (err, crime) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        console.log('New crime added:', crime.name);
        res.json(crime);
    }  
   });
});

api.get(['/crime/:crimeid', '/crime/:crimeid/:crimename'], isLoggedInJson, function (req, res) {
    /* Get specific crime based on id and */
    let query = {'_id': req.params.crimeid};
    // if user is not admin, display only if crime is in player's city
    if(!req.user.admin){
        query._city = req.user._city;
    }
    Crime.findOne(query)
    .exec(function (err, crime) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(crime);
        } 
    });
});

api.post('/crime/:crimeid/perform', isLoggedInJson, function (req, res) {
    /* Performs a crime based on id */
    Crime.findOne({'_id': req.params.crimeid, '_city': req.user._city})
    .exec(function (err, crime) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if (req.user.level < crime.level) { //Check if plaer's level is high enough
                res.status(400).json({
                    'success': false,
                    'msg': 'You need to be level: ' + crime.level + ' to perform this crime!'
                });
            } else {
                // Do some algorith stuff to calculate if you succed
                console.log(req.user);
                console.log('User.level ' + req.user.level);
                console.log(req.user.username + ' is doing crime: ' + crime.name + '. Will it succed with these params? ' + req.user.level + ' - ' + crime.level + ' - ' + getRandomInt(req.user.level, crime.difficulty));
                // Make some stupid random calc based on difficulty and check if crime is succeded
                if (getRandomInt(req.user.level, crime.difficulty) > 6) {
                    // Makes a random payout inbetween min and max
                    let payout = getRandomInt(crime.minPayout, crime.maxPayout);
                    // Updates the user with money
                    req.user.money += payout;
                    // Saves the updated user
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