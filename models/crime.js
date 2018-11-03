console.log('Hello from crime.js');
const mongoose = require('mongoose');
const autoinc = require('mongoose-plugin-autoinc').autoIncrement;

// Dependent models
const City = require('./city');

var crimeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    active: {type: Boolean, default: true},
    _city: {type: Number, ref: 'City'},
    level: {type: Number, required: true},
    difficulty: {type: Number, required: true},
    maxPayout: {type: Number, required: true},
    minPayout: {type: Number, required: true},
    added: { type: Date, default: Date.now },
    edited: { type: Date, default: Date.now }
});

crimeSchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});

crimeSchema.plugin(autoinc, 'Crime');
module.exports = mongoose.model('Crime', crimeSchema);
