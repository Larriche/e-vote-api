const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connStr = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@localhost:27017/evote';

// Connect to MongoDB database
mongoose.connect(connStr, { useNewUrlParser: true, auth: { authdb: "admin" } });
var db = mongoose.connection;

// Log mongodb errors
db.on('error', console.error.bind(console, 'connection error:'));