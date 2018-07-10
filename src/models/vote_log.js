const mongoose = require('mongoose');

var VoteLogSchema = mongoose.schema({
    voter: {
        type: Schema.Types.ObjectId,
        ref: 'Voter'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'ElectionCategory'
    },
    candidate: {
        type: Schema.Types.ObjectId,
        ref: 'ElectionCandidate'
    }
}, {
    timestamps: true
});

var VoteLog = mongoose.model('VoteLog', VoteLog);
module.exports = VoteLog;