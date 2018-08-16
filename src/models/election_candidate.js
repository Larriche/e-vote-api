// Load required modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Validator = require('validatorjs');

var ElectionCandidateSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    photo_url: String,
    election: {type: Schema.Types.ObjectId, ref: 'Election'},
    categories: [{type: Schema.Types.ObjectId, ref: 'ElectionCategory'}]
}, {
    timestamps: true
});

ElectionCandidateSchema.statics.validate = function (data) {
    let rules = {
        name: 'required',
        election_id: 'required'
    };

    let errors = {};

    // Set up request data fields validator
    let validator = new Validator(data, rules);

    if (!validator.passes()) {
        errors = validator.errors.all();
    }

    return errors;
};

var ElectionCandidate = mongoose.model('ElectionCandidate', ElectionCandidateSchema);

module.exports = ElectionCandidate;