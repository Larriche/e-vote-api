// Load required modules
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Validator = require('validatorjs');

var ElectionCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    election: {type: Schema.Types.ObjectId, ref: 'Election'}
}, {
    timestamps: true
});

ElectionCategorySchema.statics.validate = function(data)
{
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
}

/**
 * Get the query for object for getting election category listings
 *
 * @param {Object} request The request
 * @param {Promise} Query filters
 */
ElectionCategorySchema.statics.getQuery = function (request) {
    let query = ElectionCategory.find({election: request.params.election_id});

    return query;
}

const ElectionCategory = mongoose.model('ElectionCategory', ElectionCategorySchema);
module.exports = ElectionCategory;