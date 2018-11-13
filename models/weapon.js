console.log("Hello from weapon.js")
var mongoose = require("mongoose")
const autoinc = require('mongoose-plugin-autoinc').autoIncrement;

var weaponSchema = new mongoose.Schema({
    name: {type: String},
    price: {type: Number,default: 0},
    damage: {type: Number,default: 0},
    level: {type: Number, default: 0},
    active: {type: Boolean, default: true}
});

weaponSchema.pre("save", function(next) {
    this.edited = new Date();
    return next();
});

weaponSchema.plugin(autoinc, 'Weapon');
module.exports = mongoose.model("Weapon",weaponSchema);