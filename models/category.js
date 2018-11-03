console.log('Hello from category.js');
const mongoose = require('mongoose');
const autoinc = require('mongoose-plugin-autoinc').autoIncrement;

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

categorySchema.plugin(autoinc, 'Category');
module.exports = mongoose.model('Category', categorySchema);
