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
     * @param {*} request
     * @param {*} response
     * @param {*} next
     */
    store (request, response, next) {
        // Set up request data fields validator
        let validator = new Validator(request.body, {
            name: 'required',
            start_time: 'required',
            end_time: 'required'
        });

        if (validator.passes()) {
            let electionData = {
                name: request.body.name,
                start_time: request.body.start_time,
                end_time: request.body.end_time,
                code: uuid(),
                user: request.user.id
            };

            Election.create(electionData, (error, savedElection) => {
                if (error) {
                    error.status = 500;
                    next(error);
                }

                // Reload saved election with related items
                Election.findOne({_id: savedElection._id})
                    .populate('user', 'id name email')
                    .then(election => {
                        let data = {
                            election,
                            status: 'success'
                        };

                        return response.status(200).json(data);
                    })
                    .catch(error => {
                        error.status = 500;
                        next(error);
                    });
            });
        } else {
            response.status(422).json({
                errors: validator.errors.all(),
                status: 'failed'
            });
        }
    },

    /**
     * Update election whose id is given with given data
     *
     * @param {Object} request Http request
     * @param {Object} response Http Response
     * @param {Object} next The next callable
     */
    update (request, response, next) {
        // Set up request data fields validator
        let validator = new Validator(request.body, {
            name: 'required',
            start_time: 'required',
            end_time: 'required'
        });

        if (validator.passes()) {
            let electionData = {
                name: request.body.name,
                start_time: request.body.start_time,
                end_time: request.body.end_time
            };

            const noObjectMessage = 'Election was not found';

            Election.findByIdAndUpdate(request.params.id, electionData)
                .then(updatedElection => {
                    // Reload saved election with related items
                    Election.findOne({ _id: request.params.id })
                        .populate('user', 'id name email')
                        .then(election => {
                            if (!election) {
                                return response.status(404).json({
                                    status: 'sofailed',
                                    message: noObjectMessage
                                });
                            }

                            let data = {
                                election,
                                status: 'success'
                            };

                            return response.status(200).json(data);
                        })
                        .catch(error => {
                            error.status = 500;
                            next(error);
                        });
                }).catch(error => {
                    if (error.kind === 'ObjectId') {
                        return response.status(404).json({
                            status: 'failed',
                            message: noObjectMessage
                        });
                    }

                    error.status = 500;
                    next(error);
                });
        } else {
            response.status(422).json({
                errors: validator.errors.all(),
                status: 'failed'
            });
        }
    }
};

module.exports = elections;