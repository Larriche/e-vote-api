const mongoose = require('mongoose');

var PasswordResetTokenSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    token: {
        type: String
    },
    expires_at: {
        type: Date
    }
}, {
    timestamps: true
});

var PasswordResetToken = mongoose.models('PasswordResetToken', PasswordResetTokenSchema);
module.exports = PasswordResetToken;