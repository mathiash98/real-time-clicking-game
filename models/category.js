console.log('Hello from category.js');
const mongoose = require('mongoose');

// Dependent models

var categorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    active: {type: Boolean, default: true},
    added: { type: Date, default: Date.now },
    edited: { type: Date, default: Date.now }
});

categorySchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});


module.exports = mongoose.model('Category', categorySchema);
