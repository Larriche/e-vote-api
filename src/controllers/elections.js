const Validator = require('validatorjs');
const Election = require('../models/election');
const uuid = require('uuid/v1');

const elections = {
    /**
     * Get elections created by the currently authenticated user
     *
     * @param {Object} request  Http request
     * @param {Object} response Http response
     * @param {Object} next Next callable
     */
    index (request, response, next) {
        return response.status(200).json({
            status: 'success',
            elections: []
        });
    },

    /**
     * Create a new election
     *
     * @param {*} request Http Request
     * @param {*} response Http Response
     * @param {*} next Next callable
     */
    store (request, response, next) {
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

        // Check for uniqueness of this election in the user's set of elections
        Election.findOne({name: request.body.name, user: request.user.id})
            .then(election => {
                if (election) {
                    let error = new Error();

                    error.status = 422;
                    error.errors = {
                        name: ['An election with that name already exists']
                    };

                    return Promise.reject(error);
                } else {
                    return Election.create(electionData);
                }
            })
            .then((savedElection) => {
                // Reload saved election with related items
                return Election.findOne({ _id: savedElection._id })
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
                }
                else {
                    error.status = 500;
                    next(error);
                }
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
    }
};

module.exports = elections;