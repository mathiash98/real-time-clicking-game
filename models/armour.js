console.log("Hello from armour.js")
var mongoose = require("mongoose")
const autoinc = require('mongoose-plugin-autoinc').autoIncrement;

var armourSchema = new mongoose.Schema({
    name:{type: String},
    price:{type: Number,default: 0},
    defence:{type: Number,default: 0},
    level:{type: Number, default: 0}
});

armourSchema.pre("save", function(next) {
    this.edited = new Date();
    return next();
});

armourSchema.plugin(autoinc, 'Armour');
module.exports = mongoose.model("Armour",armourSchema);