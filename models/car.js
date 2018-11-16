console.log("Hello from car.js")
var mongoose = require("mongoose")

// Models
const Image = require('./image');

var carSchema = new mongoose.Schema({
    name: {type: String, requires: true},
    price: {type: Number, required: true},
    defence: {type: Number, required: true},
    _city: {type: String, required: true},
    speed: {type: Number, default: 60},
    seats: {type: Number, default: 5},
    cargo: {type: Number, default: 10},
    level: {type: Number, default: 0},
    active: {type: Boolean, default: true},
    _image: {
        _id: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'fs.files'
          }
    }
});

carSchema.pre("save", function(next) {
    this.edited = new Date();
    return next();
});

module.exports = mongoose.model("Car", carSchema);