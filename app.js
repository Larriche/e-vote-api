const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const app = require('express')();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const setupRoutes = require('./src/routes');
const boot = require('./src/services/utilities').boot;

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const connStr = `mongodb://${db_username}:${db_password}@localhost:27017/evote`;

// Connect to MongoDB database
mongoose.connect(connStr, { useNewUrlParser: true, auth: { authdb: "admin" } });
var db = mongoose.connection;

// Log mongodb errors
db.on('error', console.error.bind(console, 'connection error:'));

// Pass incoming requests through body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

setupRoutes(app);

// Handle 404s
app.use('*', function(req, res, next) {
    res.status(404).json({
        message: 'Route does not exist'
    });
});

// Final error handler
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500).json({
        errors: ['An unknown error occurred']
    });
});

http.listen(port, function () {
    console.log('Express server is listening on port', port);
    boot();
});