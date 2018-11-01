// Dependencies
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');

const config = require('./config');

// Connect to mongodb
mongoose.connect(config.mongodb.uri, { useNewUrlParser: true }, function (err) {
    if(err) {throw err;}
    console.log('Connected to mongodb');
});

// const server = https.createServer({}, app);
app.listen(config.ports[0]);
console.log('Listening on ' + config.ports[0]);

//Define template eninge
var hbs = exphbs.create({
    defaultLayout: 'main',
    partialsDir: [
      __dirname+'/views/partials/'
    ],
    layoutsDir: __dirname+'/views/layouts/',
    extname: "hbs",
    helpers: {
      json: function (content) {
        return JSON.stringify(content);
      }
    }
});

// required for passport session
app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true
}));
app.engine('hbs', hbs.engine);
app.use(express.json());
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

require('./routes/router')(app);