// Load required modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// bcrypt salting rounds
const saltRounds = 10;


var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    }
});

// Hash password before saving to database
UserSchema.pre('save', function (next) {
    var user = this;

    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if (err) {
            return next(err);
        }

        user.password = hash;
        next();
    });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;