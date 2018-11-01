api = require('express').Router();

// Models
var User = require('../models/user');
const Category = require('../models/category');
const Item = require('../models/item');

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


module.exports = api;