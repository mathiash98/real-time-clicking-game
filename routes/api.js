api = require('express').Router();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const multer = require('multer');
const config = require('../config');

// Some stuff used to get images from gridfs
let db;
let mongodb_uri = config.mongodb.uri;
if(process.argv[2] == '-local'){
    mongodb_uri = config.mongodb.localUri;
}
mongodb.MongoClient.connect(mongodb_uri, function(error, client) {
  if (error) {
      throw error;
  }
  db = client.db('mafia');
});

const fileStorage = require('multer-gridfs-storage') ({
    url: mongodb_uri
});

// Configure multer to pass files to fileStorage
const upload = multer({ storage: fileStorage})
// Multer upload file schemes
// For single image upload on fieldname _image
const sUpload = upload.single('_image');

// Models
var User = require('../models/user');
const Category = require('../models/category');
const City = require('../models/city');
const Crime = require('../models/crime');
const Weapon = require("../models/weapon");
const Armor = require("../models/armor");
const Car = require('../models/car');
// const OrganizedCrime = require("../models/organizedcrime");

function isLoggedInJson(req, res, next) {
    /* Expreess middleware, you can use to check if user is logged in, see below for examples */
    if(req.isAuthenticated()) {
        return next();
    }
    res.status(401).send(); // if not logged in, return code 401 (not authorized)
}

function isAdminJson(req, res, next) {
    /* Check if user is admin */
    if(req.isAuthenticated()) {
        if (req.user.admin){
            return next();
        }
    }
    res.status(401).send();
}

// ==================================================================================
// ===========================     PLAYER API STUFF    ==============================
// ==================================================================================

api.get('/player', function (req, res) {
    let fields = ['username', 'admin', 'level']; // Defines what fields we will retrieve from the database
    if (req.user){
        if(req.user.admin){
            fields = []; // if admin, get all fields
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
    let fields = ['username', 'admin', 'level']; // Defines what fields we will retrieve from the database
    if (req.user){
        if(req.user.admin){
            fields = []; // if admin, get all fields
        }
    }
    User.findOne({'username': req.params.username})
    .select(fields)
    .exec(function (err, data) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.json(data)
       }
    });
});

api.post('/player/:username/inventory/:itemtype/:itemid/equip', isLoggedInJson, function (req, res) {
    let prevEquipItem = false;
    switch (req.params.itemtype) {
        case 'car':
            if (req.user.equipped.car != {}) {
                prevEquipItem = req.user.equipped.car;
            }
            for (let i = 0; i < req.user.inventory.cars.length; i++) { // look for the itemid in inventory
                if (req.user.inventory.cars[i]._id == req.params.itemid){
                    req.user.equipped.car = req.user.inventory.cars[i]; // copy item to equipped
                    req.user.inventory.cars.splice(i, 1); // remove item from inventory
                    console.log(req.user.inventory.cars);
                    if(prevEquipItem){ // Add to inventory if there actually was an item there before
                        req.user.inventory.cars.push(prevEquipItem); // move the old equipped to inventory
                    }
                }
                
            }
            break;
        case 'weapon':
            if (req.user.equipped.weapon != {}) {
                prevEquipItem = req.user.equipped.weapon;
            }
            for (let i = 0; i < req.user.inventory.weapons.length; i++) { // look for the itemid in inventory
                if (req.user.inventory.weapons[i]._id == req.params.itemid){
                    req.user.equipped.weapon = req.user.inventory.weapons[i]; // copy item to equipped
                    req.user.inventory.weapons.splice(i, 1); // remove item from inventory
                    if(prevEquipItem){ // Add to inventory if there actually was an item there before
                        req.user.inventory.weapons.push(prevEquipItem); // move the old equipped to inventory
                    }
                }
                
            }
            break;
        case 'armor':
            if (req.user.equipped.armor != {}) {
                prevEquipItem = req.user.equipped.armor;
            }
            for (let i = 0; i < req.user.inventory.armors.length; i++) { // look for the itemid in inventory
                if (req.user.inventory.armors[i]._id == req.params.itemid){
                    req.user.equipped.armor = req.user.inventory.armors[i]; // copy item to equipped
                    req.user.inventory.armors.splice(i, 1); // remove item from inventory
                    if(prevEquipItem){ // Add to inventory if there actually was an item there before
                        req.user.inventory.armors.push(prevEquipItem); // move the old equipped to inventory
                    }
                }
                
            }
            break; 
        } // switch

        // Save the updated user
        req.user.save(function (err, data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({
                    success: true,
                    msg: 'You equipped item',
                    data: req.user.equipped
                });
            }
        });
});

api.put('/player/:username', isLoggedInJson, function (req, res) {
    /* Update a player, currently only admin can change stuff */
    if (req.user.admin || req.user.username == req.params.username){
        User.findOne({'username': req.params.username})
        .exec(function(err, user) {
            if (err){
                res.status(500).send(err);
            } else {
                if(req.user.admin) {
                    if (req.body.money) user.money = req.body.money;
                    if (req.body.level) user.level = req.body.level;
                    if (req.body.hp) user.hp = req.body.hp;
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
            res.json(data);
        }
    });
});

api.post("/weapon", isAdminJson, sUpload, function(req, res) {
    console.log(req.body)
    let newWeapon = new Weapon();
    newWeapon.price = req.body.price;
    newWeapon.damage = req.body.damage;
    newWeapon.name = req.body.name;
    newWeapon.level = req.body.level;
    if (req.file) {
        newWeapon._image._id = req.file.id;
    }
    if(req.body.description){
        newWeapon.description = req.body.description;
    }
    newWeapon.save(function (err,data) {
    if (err) {
        console.log(err)
        res.status(500).send(err);
    } else {
        res.json(data);
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

                // You need to make a new id for the bought item, so equipping and stuff like that actually works
                weapon._id = mongoose.Types.ObjectId();
                req.user.inventory.weapons.push(weapon);
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
// ===========================     ARMOR API STUFF      =============================
// ==================================================================================
api.get('/armor', function (req, res) {
    Armor.find()
    .sort({'level': 1}) // sort by level from 0->
    .exec(function (err, data) {
         if(err) {
             console.log(err);
             res.status(500).send(err);
         } else {
             res.json(data);
         }
    });
 });

api.post("/armor", isAdminJson, sUpload, function(req,res) {
    console.log(req.body)
    let newArmor = new Armor(req.body);
    if(req.body.description) {
        newArmor.description = req.body.description;
    }
    if (req.file) {
        newArmor._image._id = req.file.id;
    }
    newArmor.save(function (err,data) {
        if(err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

api.get('/armor/:armorid', function (req, res) {
   Armor.findById(req.params.armorid, function (err, data) {
        if(err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json(data);
        }
   });
});

api.post("/armor/:armorid/purchase", isLoggedInJson, function(req,res) {
    Armor.findById(req.params.armorid)
    .exec(function(err, armor) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if (req.user.money < armor.price) {
                res.json({
                    "success": false,
                    "msg": "You need to have a minimum of " + armor.price + " to buy this armor."
                });
            } else if (req.user.level < armor.level) {
                res.json({
                    "success":false,
                    "msg": "You need to have a minimum level of " + armor.level + "to buy this armor"
                });
            } else {
                req.user.money -= armor.price;
                // You need to make a new id for the bought item, so equipping and stuff like that actually works
                armor._id = mongoose.Types.ObjectId();
                req.user.inventory.armors.push(armor);
                req.user.save(function(err, data) {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);

                    } else {
                        res.json({
                            "success": true,
                            "msg": "You have now bought " + armor.name + " !" 
                        });
                    }
                });

            }

        }
    });
});

// ==================================================================================
// ===========================     CAR API STUFF      ===============================
// ==================================================================================
api.get('/car', function (req, res) {
   Car.find()
   .sort({level: 1})
   .exec(function (err, cars) {
      if (err) {
          res.status(500).send(err);
      } else {
          res.send(cars);
      } 
   });
});

api.post('/car', isAdminJson, sUpload, function (req, res) {
   let tmpCar = new Car(req.body);
   if (req.file) {
        tmpCar._image._id = req.file.id;
    }
   tmpCar.save(function (err, car) {
    if (err) {
        res.status(500).send(err);
    } else {
        res.send(car);
    } 
   });
});

api.get('/car/:carid', function (req, res) {
   Car.findById(req.params.carid, function (err, car) {
    if (err) {
        res.status(500).send(err);
    } else {
        res.send(car);
    } 
   });
});

api.post('/car/:carid/purchase', isLoggedInJson, function (req, res) {
    Car.findById(req.params.carid, function (err, car) {
     if (err) {
         res.status(500).send(err);
     } else {
         if (car.price > req.user.money) {
             res.json({
                 success: false,
                 msg: 'You need ' + car.price + ' money to buy this car. Go do some crime!'
             });
         } else {
             req.user.money -= car.price;
             // You need to make a new id for the bought item, so equipping and stuff like that actually works
             car._id = mongoose.Types.ObjectId();
             req.user.inventory.cars.push(car);
             req.user.save(function (err, data) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json({
                        success: true,
                        msg: 'You bought ' + car.name,
                        price: car.price
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

api.post('/city/:cityname/travel', isLoggedInJson, function (req, res) {
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
                if (req.user.level >= data.level) {
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
    console.log('body:', req.body);
   let newCrime = new Crime(req.body);
   console.log('newCrime:', newCrime);
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

api.delete('/crime/:crimeid', isAdminJson, function (req, res) {
   Crime.findByIdAndDelete(req.params.crimeid, function (err, data) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
        res.json(data);
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
                msg: 'You need to be level: ' + crime.level + ' to perform this crime!'
            });
            } else {
                console.log('Level is high enough');
                let timenow = Date.now();
                function checkCoolDown() {
                    /* Calculate if timenow is greater than end of cooldown */
                    let cooldownObject = req.user.cooldown.get(crime._id.toString());
                    if (cooldownObject != null) { // check if crim._id is found in req.user.cooldown map
                        let delta = cooldownObject.end - timenow;  // time difference in milliseconds
                        if (delta > 0) {
                            return delta;
                        } else {
                            // req.user.cooldown.delete(crime._id.toString()); // hmm should we delete it or just keep it?
                            return false;
                        }
                    }
                    return false
                };
                let cooldown = checkCoolDown();
                if (cooldown){
                    res.json({
                        success: false,
                        msg: 'Wait ' + Math.floor(cooldown/1000) + ' seconds.'
                    });
                } else {
                    let responseJSON = {}; // the object which will eventually be sent back to client
                    
                    // Do some algorith stuff to calculate if you succed
                    // Make some stupid random calc based on difficulty and check if crime is succeded
                    // Calculate percetage of success based on req.user.experience and crime.difficulty
                    // Get percentage a function which goes to max 90%
                    // then check if getRandomInt(0, 100) < percentage
                    function calcPercentageSuccess(user, crime) {
                        /* Calculate probability for success based on user against difficulty 
                            https://www.desmos.com/calculator/agxuc5gip8 <-- Use this to make some pretty graph
                            g\left(x\right)=d+\frac{c}{1+ab^x} <-- paste this to have same graph thing
                            https://gamedev.stackexchange.com/questions/14309/how-to-develop-rpg-damage-formulas?newreg=68ca388cd9ee4957a59ca119ff68b4e8
                            ^^ used this question as help
                        */
                        let userLevel = user.level;
                        let crimeDiff = crime.difficulty;
                        let minPercentage = 0.3; // needs to be calculated based on level
                        let maxPercentage = 0.9;
                        let c = maxPercentage - minPercentage;
                        let k = 0.68;
                        let b = Math.E ** (-k);

                        let probability = (minPercentage + ( c/(1 + crimeDiff*b**userLevel) ));
                        // console.log('Probability is: ' + probability + ' for ' + crime.name + ' with user '+req.user.username+' on level: ' + userLevel);
                        return 100*probability;

                        // Maybe add som personality stats here as well
                        // Like intelligence, etc
                        // Crimes might need some properties like defence
                        // surveillance boolean, so you need good intelligence or whatever
                        // Stafflevel etc
                        // Busy or not, crowded=less likelyhood

                    }

                    if (getRandomInt(0,100) < calcPercentageSuccess(req.user, crime)) {
                        // Makes a random payout inbetween min and max
                        let payout = getRandomInt(crime.minPayout, crime.maxPayout);
                        // Updates the user with money
                        req.user.money += payout;
                        //Add experience to the player, based on crime.experience
                        req.user.xp += crime.experience;
                        if(req.user.xp == req.user.xp_to_level) {
                            req.user.xp = 0;
                            req.user.xp_to_level += req.user.xp_to_level;
                            req.user.level += 1;
                        }
                        
                        // find a random message based on msgSuccess array
                        let tmpMsg = crime.msgSuccess[getRandomInt(0, crime.msgSuccess.length-1)];
                        responseJSON = {
                            success: true,
                            msg: tmpMsg, 
                            reward: payout,
                            experience: crime.experience
                        };
                    } else {
                        // Need some algorith to check if user goes to jail
                        
                        // find a random message based on msgFalse array
                        let tmpMsg = crime.msgFalse[getRandomInt(0, crime.msgFalse.length-1)];
                        responseJSON = {
                            success: false,
                            msg: tmpMsg
                        };
                    } // ifelse success
                    
                    // Set cooldown
                    let cooldownEnd = timenow + (crime.cooldown*1000);
                    req.user.cooldown.set(crime._id.toString(), {start: timenow, end: cooldownEnd});
                    responseJSON.cooldownEnd = cooldownEnd;
                    // all the logic is now done, will now update the user and then return message to client
                    // Saves the updated user
                    req.user.save(function (err, updatedUser) {
                       if(err) {
                           console.log(err);
                           res.status(500).send(err);
                       } else {   
                           res.json(responseJSON); // Return the response object back to user
                       }
                    });
                } // ifelse cooldown
            } // ifelse level
        } // ifelse err 
    });
});
// ===========================  ==========================   ============================
// ===========================  Organized Crime API STUFF   =============================
// ===========================  ==========================   ============================
api.post("/organizedcrime", isAdminJson, function (req, res) {
    let newOrganizedCrime = new OrganizedCrime(req.body);

    newOrganizedCrime.save(function(err,organizedcrime) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            console.log("New organized crime added.",organizedcrime.name);
            res.json(organizedcrime);
        }
    })

});

api.post("/organizedcrime/:organizedcrimeid/perform", isLoggedInJson, function(req, res) {
    OrganizedCrime.findOne({"_id": req.params.organizedcrimeid, "_city": req.user._city})
    .exec(function (err, organizedcrime) {
        if (err) {
            console.log(err)
            res.status(500).send(err);
        } else {
            //Add crime logic
        }
    })
})


// ==================================================================================
// ===========================     Image API STUFF    ===============================
// ==================================================================================

api.get('/image/:imageid', function (req, res) {
    /* API for getting images */
    console.log('looking for:', req.params.imageid);
    const bucket = new mongodb.GridFSBucket(db, {});
    bucket.openDownloadStream(new mongodb.ObjectID(req.params.imageid))
        .on('error', function(error) {
        assert.ifError(error);
        console.log('error');
        res.status(500).send(error);
        })
        .on('finish', function() {
        console.log('done!');
        process.exit(0);
        })
        .pipe(res);
});

api.post('/image', isAdminJson, sUpload, function (req, res) {
    /* General image posting API */
    console.log(req.body);
    console.log(req.file);
    res.send(req.file);
});

module.exports = api;