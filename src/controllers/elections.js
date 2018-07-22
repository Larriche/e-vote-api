const Validator = require('validatorjs');
const Election = require('../models/election');
const uuid = require('uuid/v1');
const services = require('../services');
const Utilities = services.Utilities;

const elections = {
    /**
     * Get elections created by the currently authenticated user
     *
     * @param {Object} request  Http request
     * @param {Object} response Http response
     * @param {Object} next Next callable
     */
    async index (request, response, next) {
        let pagination = Utilities.getPaginationParams(request.query);
        let query = Election.getQuery(request);
        let queryFilters = query.getQuery();

        let responseData = {
            status: 'success'
        };

        try {
            let elections = await query.skip(pagination.skip).limit(pagination.limit).sort('-createdAt')
                                      .populate('categories')
                                      .populate('user')
                                      .exec();

            let total = elections.length ? (await Election.countDocuments(queryFilters).exec()) : 0;

            responseData.elections = elections;
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
     * Create a new election
     *
     * @param {*} request Http Request
     * @param {*} response Http Response
     * @param {*} next Next callable
     */
    async store (request, response, next) {
        let validationErrors = Election.validate(request.body);

        if (Object.keys(validationErrors).length) {
            return response.status(422).json({
                errors: validationErrors,
                status: 'failed'
            });
        }

        let electionData = {
            name: request.body.name,
            start_time: request.body.start_time,
            end_time: request.body.end_time,
            code: uuid(),
            user: request.user.id
        };

        try {
            // Check for uniqueness of this election in the user's set of elections
            let existingElection = await Election.findOne({ name: request.body.name, user: request.user.id }).exec();

            if (existingElection) {
                return response.status(422).json({
                    errors: {
                        name: ['An election with that name already exists']
                    }
                });
            }

            let savedElection = await Election.create(electionData);
            let election = await Election.findOne({ _id: savedElection._id })
                .populate('user', 'id name email')
                .exec();

            let data = {
                election,
                status: 'success'
            };

            return response.status(200).json(data);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Get the election with the given ID
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    show (request, response, next) {
        Election.findById(request.params.id)
            .then(election => {
                if (election) {
                    if (election.user == request.user.id) {
                        return response.status(200).json({
                            status: 'success',
                            election
                        });
                    } else {
                        return response.status(403).json({
                            status: 'failed',
                            message: 'You are not allowed to access this election'
                        });
                    }

                } else {
                    return response.status(404).json({
                        status: 'failed',
                        message: 'Election was not found'
                    });
                }
            })
            .catch(error => {
                error.status = 500;
                next(error);
            });
    },

    /**
     * Update election whose id is given with given data
     *
     * @param {Object} request Http request
     * @param {Object} response Http Response
     * @param {Object} next The next callable
     */
    update (request, response, next) {
        let validationErrors = Election.validate(request.body);

        let electionData = {
            name: request.body.name,
            start_time: request.body.start_time,
            end_time: request.body.end_time
        };

        Election.findById(request.params.id)
            .then(election => {
                if (!election) {
                    let error = new Error();

                    error.status = 404;
                    error.message = 'Election was not found';

                    return Promise.reject(error);
                } else {
                    if (Object.keys(validationErrors).length) {
                        let error = new Error();

                        error.status = 422;
                        error.errors = validationErrors;

                        return Promise.reject(error);
                    } else {
                        return Election.findOne({
                            name: request.body.name,
                            user: request.user.id,
                            _id: { $ne: request.params.id }
                        });
                    }
                }
            })
            .then(election => {
                if (election) {
                    let error = new Error();

                    error.status = 422;
                    error.errors = {
                        name: ['Another election with that name already exists']
                    };

                    return Promise.reject(error);
                } else {
                    return Election.findByIdAndUpdate(request.params.id, electionData);
                }
            })
            .then(updatedElection => {
                return Election.findOne({ _id: request.params.id })
                    .populate('user', 'id name email');
            })
            .then(election => {
                let data = {
                    election,
                    status: 'success'
                };

                return response.status(200).json(data);
            })
            .catch(error => {
                if (error.status == 422) {
                    return response.status(422).json({
                        errors: error.errors
                    });
                } else if(error.status == 404) {
                    return response.status(404).json({
                        message: error.message
                    });
                } else {
                    error.status = 500;
                    next(error);
                }
            });
    },

    /**
     * Remove election whose id is given from the database
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    destroy (request, response, next) {
        Election.findById(request.params.id)
            .then(election => {
                if (election) {
                    if (election.user == request.user.id) {
                        election.remove();

                        return response.status(200).json({
                            status: 'success',
                            message: 'Election has been deleted'
                        });
                    } else {
                        return response.status(403).json({
                            status: 'failed',
                            message: 'You are not allowed to access this election'
                        });
                    }

                } else {
                    return response.status(404).json({
                        status: 'failed',
                        message: 'Election was not found'
                    });
                }
            })
            .catch(error => {
                error.status = 500;
                next(error);
            });
    }
};

module.exports = elections;