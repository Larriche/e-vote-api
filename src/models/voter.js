const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Validator = require('validatorjs');

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

VoterSchema.statics.validate = function (data) {
    let rules = {
        name: 'required',
        email: 'required|email'
    };

    let errors = {};

    let validator = new Validator(data, rules);

    if (!validator.passes()) {
        errors = validators.errors.all();
    }

    return errors;
}

VoterSchema.statics.getQuery =  function (request) {
    let query = Voter.find({election: request.params.election_id});

    return query;
}

var Voter = mongoose.model('Voter', VoterSchema);
module.exports = Voter;