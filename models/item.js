console.log('Hello from item.js');
const mongoose = require('mongoose');

// Dependent models
const Category = require('./category');
const User = require('./user');

var itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    _owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    description: String,
    level: {type: Number, default: 0},
    _category: {type: Number, ref: 'Category'},
    details: {
        damage: Number,
        speed: Number,
        capacity: Number
    },
    active: {type: Boolean, default: true},
    added: { type: Date, default: Date.now },
    edited: { type: Date, default: Date.now }
});

itemSchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});


module.exports = mongoose.model('Item', itemSchema);
