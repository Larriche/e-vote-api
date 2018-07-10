const mongoose = require('mongoose');

var VoterSchema = mongoose.schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    token: {
        type: String,
    },
    election: {
        type: Schema.Types.ObjectId,
        ref: 'Election'
    }
});

var Voter = mongoose.model('Voter', VoterSchema);
module.exports = Voter;