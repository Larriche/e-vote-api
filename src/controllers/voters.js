const Validator = require('validatorjs');
const services = require('../services');
const Utilities = services.Utilities;
const uuid = require('uuid/v1');

const Voter = require('../models/voter');
const Election = require('../models/election');

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

        if (Object.keys(validationErrors).length) {
            return response.status(422).json({
                errors: validationErrors,
                status: 'failed'
            });
        }

        try {
            let errors = {};

            let election = await Election.findById(request.body.election_id).exec();

            if (!election) {
                errors.election_id = ['This election does not exist'];
            }

            let existingVoter = await Voter.findOne({name: request.body.name, election: request.body.election_id}).exec();

            if (existingVoter) {
                errors.name = ['A voter with that name already exists'];
            }

            if (Object.keys(errors).length) {
                return response.status(422).json({
                    errors,
                    status: 'failed'
                });
            }

            let voterData = {
                name: request.body.name,
                email: request.body.email,
                token: uuid(),
                election: request.body.election_id
            }

            let voter = await Voter.create(voterData);
            voter = await Voter.findById( voter._id )
                .populate('election')
                .exec();

            return response.status(200).json({
                status: 'success',
                voter
            });

        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
}

module.exports = voters;