// Load required modules

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Validator = require('validatorjs');
const mongoosePaginate = require('mongoose-paginate');


var ElectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    start_time: Date,
    end_time: Date,
    code: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{type: Schema.Types.ObjectId, ref: 'ElectionCategory'}]
}, {
    timestamps: true
});

ElectionSchema.statics.validate = function(data) {
    let rules = {
        name: 'required',
        start_time: 'required|date',
        end_time: 'required|date'
    };

    let errors = {};

    // Set up request data fields validator
    let validator = new Validator(data, rules);

    if (!validator.passes()) {
        errors = validator.errors.all();
    }

    // Check for the validity of the order of start and end dates
    if (Date.parse(data.start_time) > Date.parse(data.end_time)) {
        errors.start_time = ['The start time must be before the end time'];
    }

    return errors;
}

var Election = mongoose.model('Election', ElectionSchema);
module.exports = Election;