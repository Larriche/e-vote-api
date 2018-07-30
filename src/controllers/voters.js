const Validator = require('validatorjs');
const Voter = require('../models/voter');
const services = require('../services');
const Utilities = services.Utilities;

const voters = {
    /**
     * Get a listing of voters for an election
     *
     * @param {Object} request HTTP request
     * @param {Object} response HTTP response
     * @param {Object} next Next callable middleware
     */
    async index(request, response, next) {
        let pagination = Utilities.getPaginationParams(request.query);
        let query = Voter.getQuery(request);
        let queryFilters = query.getQuery();

        try {
            let voters = await query.skip(pagination.skip).limit(pagination).sort('-createdAt')
                .populate('election')
                .exec();

            let total = voters.length ? (await Voter.countDocuments(queryFilters).exec()) : 0;

            let responseData = {
                voters,
                status: 'success'
            };

            if (pagination.limit) {
                responseData = Utilities.setPaginationFields(request, responseData, total);
            }

            return response.status(200).json(responseData);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Register a new voter for an election
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callble middleware
     */
    async store(request, response, next) {
        let validationErrors = Voter.validate(request.body);

    }
}

module.exports = voters;