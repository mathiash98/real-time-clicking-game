console.log('Hello from user.js');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;


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
      xp: {
        type: Number,
        default:0
      },
      xp_to_level: {
        type: Number,
        default: 100
      },

      level: {
        type: Number,
        default: 1
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
      _city: {type: String, default: "Bergen"},
      inventory: {
        weapons: [{type: Object, default: {}}],
        armors: [{type: Object, default: {}}],
        cars: [{type: Object, default: {}}]
      },
      equipped: {
        car: {type: Object},
        armor: {type: Object},
        weapon: {type: Object}
      },
      cooldown: {type: Map, of: mongoose.Mixed, default: new Map()},
      // cooldown: [{
      //   _id: {type: Number},
      //   started: {type: Date},
      //   end: {type: Date}
      // }],
      missionList: {
        list: []
      },
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
