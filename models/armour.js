console.log("Hello from armor.js")
var mongoose = require("mongoose")
const autoinc = require('mongoose-plugin-autoinc').autoIncrement;

var armorSchema = new mongoose.Schema({
    name:{type: String},
    price:{type: Number,default: 0},
    defence:{type: Number,default: 0},
    level:{type: Number, default: 0}
});

armorSchema.pre("save", function(next) {
    this.edited = new Date();
    return next();
});

armorSchema.plugin(autoinc, 'Armor');
module.exports = mongoose.model("Armor",armorSchema);