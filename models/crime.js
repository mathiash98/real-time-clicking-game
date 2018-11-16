console.log('Hello from crime.js');
const mongoose = require('mongoose');

// Dependent models
const City = require('./city');

var crimeSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    _city: {type: String},
    level: {type: Number, required: true},
    difficulty: {type: Number, required: true},
    maxPayout: {type: Number, required: true},
    minPayout: {type: Number, required: true},
    added: {type: Date, default: Date.now},
    edited: {type: Date, default: Date.now},
    msgSuccess: [{type: String, required: true}],
    msgFalse: [{type: String, required: true}],
    experience: {type: Number, required: true},
    cooldown: {type: Number, required: true}, // cooldown period in seconds
    active: {type: Boolean, default: true}
});

crimeSchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});

module.exports = mongoose.model('Crime', crimeSchema);
