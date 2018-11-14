console.log('Hello from image.js');
const mongoose = require('mongoose');

// Dependent models

var imageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    active: {type: Boolean, default: true},
    added: { type: Date, default: Date.now },
    edited: { type: Date, default: Date.now }
});

imageSchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});

module.exports = mongoose.model('Image', imageSchema);
