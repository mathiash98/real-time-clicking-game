/* The main file to run
* Connects to database
* Starts to listen for http request on port
* Configures express middlewares
*/
// Dependencies
const express = require('express'); // Module which handles all http requests and rendering of html etc 
const path = require('path');
const exphbs = require('express-handlebars'); // View engine plugin which allows us to render html based on data 
const session = require('express-session'); // For passing authentication cookies from request to request, so users doesn't have to login every time
const mongoose = require('mongoose'); // Database motor
const app = express(); // Creates an express app,

const config = require('./config'); // Our config file

// Connect to mongodb database
mongoose.connect(config.mongodb.uri, { useNewUrlParser: true }, function (err) {
    if(err) {throw err;}
    console.log('Connected to mongodb at:', config.mongodb.uri);
});

// const server = https.createServer({}, app); // If we wan't to listen for crypted https traffic, needs certificate
app.listen(config.ports[0]); // Start listening for http requests on port
console.log('Listening on ' + config.ports[0]);

//Define handlebars settings
var hbs = exphbs.create({
    defaultLayout: 'main', // Our main page layout, the border/wrapper/container, where the different pages will be inserted to
    partialsDir: [
      __dirname+'/views/partials/' // Partials are html/handlebars pieces which can be inserted with {{> nameOnPartial}}. For example navbar is a partial
    ], 
    layoutsDir: __dirname+'/views/layouts/', // Where are the borders/wrappers/containers stored, the folder where main.hbs is
    extname: "hbs", // Extensionname for the handlebars files
    helpers: {
      // Helpers are javascript functions which can be called in handlebars files using for example {{json dataYouWantToStringify}}
      json: function (content) {
        /* enables storage of objects in script inside html for example {{{json user}}} <- remember use 3 curly brackets first */
        return JSON.stringify(content);
      }, // json
      logHelper: function (v1, operator, v2, options) {
        switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
              return options.inverse(this);
        }

      }, // logHelper
      calcPercentageSuccess: function (userLevel, crime) {
            /* need to move this function somewhere else, currently this is a copy of the function in api/crime */
            let crimeDiff = crime.difficulty;
            let minPercentage = 0.3; // needs to be calculated based on level
            let maxPercentage = 0.9;
            let c = maxPercentage - minPercentage;
            let k = 0.68;
            let b = Math.E ** (-k);

            let probability = (minPercentage + ( c/(1 + crimeDiff*b**userLevel) ));
            // console.log('Probability is: ' + probability + ' for ' + crime.name + ' with user '+req.user.username+' on level: ' + userLevel);
            return Math.floor(100*probability);
        }
    }


  });

// required for passport session
app.use(session({
    secret: config.secret, // I think secret is used to encrypt the authentication cookie
    saveUninitialized: true, // I think this is supposed to save user logins over server restarts
    resave: true // same with this one, but it needs some more settings about where to save (mongoStore) or something like that
}));
app.engine('hbs', hbs.engine); // Sets handlebars as view engine
app.set('view engine', 'hbs'); // Probably redundant because of line above
app.use(express.json()); // Makes us to automatically parse incoming json as json
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Makes the folder public open for all requests, so ip:port/public/stylesheets/style.css will get the style sheet

// run the router with app as argument
// Router is where http requests ar routed to their designated place
// App is the express app which listens for requests on port
require('./routes/router')(app);