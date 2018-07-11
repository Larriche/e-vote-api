const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const connStr = `mongodb://${db_username}:${db_password}@localhost:27017/evote`;

// Connect to MongoDB database
mongoose.connect(connStr, { useNewUrlParser: true, auth: { authdb: "admin" } });
var db = mongoose.connection;

// Log mongodb errors
db.on('error', console.error.bind(console, 'connection error:'));