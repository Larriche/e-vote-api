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

var ElectionCategory = mongoose.model('ElectionCategory', ElectionCategorySchema);
module.exports = ElectionCategory;