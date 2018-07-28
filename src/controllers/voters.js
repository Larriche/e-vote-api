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
    }
}

module.exports = voters;