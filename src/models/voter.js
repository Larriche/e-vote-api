const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var VoterSchema = new Schema({
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

VoterSchema.statics.getQuery =  function (request) {
    let query = Voter.find({election: request.params.election_id});

    return query;
}

var Voter = mongoose.model('Voter', VoterSchema);
module.exports = Voter;