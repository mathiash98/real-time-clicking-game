console.log("Hello from armor.js")
var mongoose = require("mongoose")

var armorSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    price: {type: Number, default: 0},
    defence: {type: Number, default: 0},
    level: {type: Number, default: 0},
    _image: {
        _id: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'fs.files'
          }
    },
    active: {type: Boolean, default: true}
});

armorSchema.pre("save", function(next) {
    this.edited = new Date();
    return next();
});

module.exports = mongoose.model("Armor",armorSchema);