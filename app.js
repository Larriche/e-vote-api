const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const app = require('express')();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const connStr = `mongodb://${db_username}:${db_password}@localhost:27017/evote`;

// Connect to MongoDB database
mongoose.connect(connStr, { useNewUrlParser: true, auth: { authdb: "admin" } });
var db = mongoose.connection;

// Log mongodb errors
db.on('error', console.error.bind(console, 'connection error:'));

http.listen(port, function () {
    console.log('Express server is listening on port', port);
})