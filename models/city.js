console.log('Hello from item.js');
const mongoose = require('mongoose');
const autoinc = require('mongoose-plugin-autoinc').autoIncrement;

// Dependent models

var citySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    description: String,
    level: {type: Number, default: 0},
    active: {type: Boolean, default: true},
    added: { type: Date, default: Date.now },
    edited: { type: Date, default: Date.now }
});

citySchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});

citySchema.plugin(autoinc, 'City');
module.exports = mongoose.model('City', citySchema);
