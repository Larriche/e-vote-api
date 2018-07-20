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

ElectionSchema.statics.validate = function(data)
{
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

/**
 * Get the query fliters to be used for getting election listing based on
 * request params
 *
 * @param {Object} request The request
 * @param {Promise} Query filters
 */
ElectionSchema.statics.getQueryFilters = function (request)
{
    // We are only getting elections of the authenticated user
    let query = {user: request.user.id};

    if (request.query.hasOwnProperty('start_time_before')) {
        query.start_time = Object.assign({}, query.start_time, { $lte: new Date(request.query.start_time_before)});
    }

    if (request.query.hasOwnProperty('start_time_after')) {
        query.start_time = Object.assign({}, query.start_time,  { $gte: new Date(request.query.start_time_after)});
    }

    if (request.query.hasOwnProperty('created_before')) {
        query.createdAt = Object.assign({}, query.createdAt, { $lte: new Date(request.query.created_before)});
    }

    if (request.query.hasOwnProperty('created_after')) {
        query.createdAt = Object.assign({}, query.createdAt, { $gte: new Date(request.query.created_after)});
    }

    return query;
}


var Election = mongoose.model('Election', ElectionSchema);
module.exports = Election;