LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

module.exports = function (passport) {

     // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, {
        "local_login.password": 0
        }, function(err, user) {
        done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy(function (username, password, done) {
            console.log(username, password);
            console.log(typeof username, typeof password);
            if (username) {
                username = username.toLowerCase()
            }
            
            // Async
            process.nextTick(function () {
                console.log('gonna check if user exists');
                // Check if user exists
                User.findOne({'username': username}, function (err, user) {
                    if (err) {
                       return done(err);
                    }
                    // If no user is found
                   if (!user) {
                       return done(null, false, {message: 'Incorrect username.'});
                   }
                   
                    // Compare password with user
                   user.comparePassword(password, function (err, isMatch) {
                        if (err){
                            return done(err);
                        }
                        // if match return user 
                        if (isMatch){
                            return done(null, user);
                        } else {
                            return done(null, false, {message: 'Incorrect password.'});
                        }
                       
                   });
    
                });
            });
        }
    ));


    // =========================================================================
    // LOCAL register =============================================================
    // =========================================================================
    passport.use('local-register', new LocalStrategy(function (username, password, done) {
        username = username.toLowerCase();

        process.nextTick(function () {
            User.findOne({'username': username}, function (err, user) {
               if (err) {return done(err);}
               if (user) {return done(null, false, {message:'username is already in use.'});}
               
               var newUser = new User();
               newUser.username = username;
               newUser.local_login.password = password;

               newUser.save(function (err, newUser) {
                    if (err) {return done(err);}
                    return done(null, newUser, {message: username+' has been created.'})
               });
            });
        });
    }));

    return passport;
}