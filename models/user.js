console.log('Hello from user.js');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

// Dependent models
const Item = require('./item');
const City = require('./city');

var userSchema = new mongoose.Schema({
      username: {
        type: String,
        unique: true,
        required: true
      },
      local_login: {
        password: String
      },
      google_login: {
        id: String,
        token: String,
        email: String,
        name: String
      },
      admin: {
        type: Boolean,
        default: false
      },
      level: {
        type: Number,
        default: 0
      },
      attackPoints: {type: Number, default: 0},
      defencePoints: {type: Number, default: 0},
      jail: {type: Boolean, default: false},
      jailInfo: {
        start: Date,
        end: Date
      },
      money: {
        type: Number,
        default: 1000
      },
      hp: {
        type: Number,
        default: 100
      },
      _city: {type: Number, ref: 'City'},
      _inventory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' }],
      _equipped: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' }],
      active: {type: Boolean, default: true},
      added: { type: Date, default: Date.now },
      edited: { type: Date, default: Date.now }
    });

userSchema.pre('save', function(next) {
  var user = this;
  if(this.isNew){
  }
    user.edited = new Date();
    if (user.isModified('local_login.password') || user.isNew && typeof user.local_login.password != 'undefined') {
      bcrypt.hash(user.local_login.password, SALT_WORK_FACTOR, function (err, hash) {
        if (err) return next(err);
        user.local_login.password = hash;
        next();
      });
    } else {
      return next();
    }
});

userSchema.methods.comparePassword = function(pass, cb) {
  // console.log("==========Comparing password================");
    bcrypt.compare(pass, this.local_login.password, function(err, isMatch) {
        if (err) {
          console.log(err);
          return cb(err);
        } else {
          cb(null, isMatch);
        }
    });
};

module.exports = mongoose.model('User', userSchema);
