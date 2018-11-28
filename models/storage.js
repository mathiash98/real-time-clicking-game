/* 
I'm thinking about making some kind of object where users can store items, like weapon, cars, money etc
1. But should the storage stuff be like weapons, where many users can have the same type of storage in multiple cities
2. Or should each storage item be owned by one user, so this item can contain all the lists over stored items etc...
I think we should do the last method, and maybe have storageSize model where info about this particular size is stored
Like storageSize model can contain something like this:
{
    name: 'Warehouse',
    maxCars: 30,
    maxMoney: 30000000,
    maxWeed: 5123123,
    maxWeapons: 100,
    price: 234999,
    _image: [objectid, ref: gridfs.images]
}

Then this model can have a type property which refers to the storageSize.
But the question is how often will we edit size of storages? I think never... so maybe we should just copy the properties from storageSize into storage when it's created

3. Or should storages be saves in the user model under _storages: [{}] <- list of this model here.
so when users buy storages in the store, we add the storagesize element or whatever into _storages
*/
console.log('Hello from storage.js');
const mongoose = require('mongoose');

// Dependent models
const User = require('./user');
// const Weapon = require('./weapon');
// const Car = require('./car');

var storageSchema = new mongoose.Schema({
    name: {type: String},
    _owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    description: String,
    _storageSize: Number, // {type: Number, ref: 'StorageSize'} <-
    // details: { // <----- this is the alternative to the line above, copy the item's property into this model
    //     name: 'Warehouse',
    //     maxCars: 30,
    //     maxMoney: 30000000,
    //     maxWeed: 5123123,
    //     maxWeapons: 100,
    //     price: 234999,
    //     _image: [objectid, ref: gridfs.images]
    // },
    _cars: [], // {type: mongoose.Schema.Types.ObjectId, ref: 'Car'}
    weapons: [], // {type: mongoose.Schema.Types.ObjectId, ref: 'Weapon'}
    _protections: [], // {type: mongoose.Schema.Types.ObjectId, ref: 'HouseDefence'} <- list of security items on this item
    standardDefencePoints: Number,
    defencePoints: Number, // Number of defence points including _protections items
    hidden: Boolean, // maybe have a property where people can build storages under the ground and other players have to scout for them in each city for a hefty sum of money
    robberyCooldown: { // Avoid being robbed all the time... Maybe make the cooldown higher if the level differnece in the players are high?
        start: Date, // Start datetime of last robbery
        end: Date // when the cooldown will end
    },
    active: {type: Boolean, default: true},
    added: { type: Date, default: Date.now },
    edited: { type: Date, default: Date.now }
});

storageSchema.pre('save', function(next) {
    this.edited = new Date();
    return next();
});


module.exports = mongoose.model('Storage', storageSchema);
