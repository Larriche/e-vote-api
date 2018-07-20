// Load required modules

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Validator = require('validatorjs');
const mongoosePaginate = require('mongoose-paginate');

const services = require('../services');
const Utilities = services.Utilities;


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
 * Get the query for object for getting election listings
 * Date-related before and after fields consider the given
 * date inclusive
 *
 * @param {Object} request The request
 * @param {Promise} Query filters
 */
ElectionSchema.statics.getQuery = function (request)
{
    let query = Election.find();

    if (request.query.hasOwnProperty('start_time_before')) {
        query.where('start_time').lte(new Date(request.query.start_time_before + ' 23:59:00'));
    }

    if (request.query.hasOwnProperty('start_time_after')) {
        query.where('start_time').gte(new Date(request.query.start_time_after + ' 00:00:00'));
    }

    if (request.query.hasOwnProperty('created_before')) {
        query.where('createdAt').lte(new Date(request.query.created_before + ' 23:59:00'));
    }

    if (request.query.hasOwnProperty('created_after')) {
        query.where('createdAt').gte(new Date(request.query.created_after + ' 00:00:00'));
    }

    if (request.query.hasOwnProperty('status')) {
        if (request.query.status == 'open') {
            query.and([
                {start_time: {$lte: new Date()}},
                {end_time: {$gte: new Date()}}
            ]);
        } else {
            query.or([
                {start_time: {$gte: new Date()}},
                {end_time: {$lte: new Date()}}
            ]);
        }
    }

    return query;
}


var Election = mongoose.model('Election', ElectionSchema);
module.exports = Election;