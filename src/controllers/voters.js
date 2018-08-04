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
    },

    /**
     * Get the voter with the given ID
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next Next callable
     */
    async show(request, response, next) {
        try {
            let voter = await Voter.findById(request.params.id)
                .populate('election')
                .exec();

            if (!voter) {
                return response.status(404).json({
                    status: 'failed',
                    message: 'Voter was not found'
                });
            }

            if (voter.election.user != request.user.id) {
                return response.status(403).json({
                    status: 'failed',
                    message: 'You are not allowed to access this voter'
                });
            }

            return response.status(200).json({
                status: 'success',
                voter
            });
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
   * Update the voter with the given ID
   *
   * @param {Object} request HTTP request
   * @param {Object} response HTTP response
   * @param {Object} next Next callable
   */
    async update(request, response, next) {
        try {
            let validationErrors = Voter.validate(request.body);

            if (Object.keys(validationErrors).length) {
                return response.status(422).json({
                    errors: validationErrors,
                    status: 'failed'
                });
            }

            let voter = await Voter.findById(request.params.id)
                .populate('election')
                .exec();

            if (!voter) {
                return response.status(404).json({
                    status: 'failed',
                    message: 'Voter was not found'
                });
            }

            if (voter.election.user != request.user.id) {
                return response.status(403).json({
                    status: 'failed',
                    message: 'You are not allowed to access this voter'
                });
            }

            let existingVoter = await Voter.findOne({
                    name: request.body.name,
                    election: request.body.election_id,
                    _id: { $ne: request.params.id }
                })
                .exec();

            if (existingVoter) {
                return response.status(422).json({
                    errors: {
                        name: ['A voter with that name already exists']
                    },
                    status: 'failed'
                });
            }

            let voterData = {
                name: request.body.name,
                email: request.body.email,
                election: request.body.election_id
            }

            let updatedVoter = await Voter.findByIdAndUpdate(request.params.id, voterData)
                .exec();

            voter = await Voter.findById(request.params.id)
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