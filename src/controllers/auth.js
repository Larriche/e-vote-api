const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const config = process.env;
const Validator = require('validatorjs');
const jwtSecret = config.SECRET.toString().trim();
const _ = require('lodash');

const auth = {
    /**
     * Sign a user up
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {Object} next Next callable in chain
     */
    register (request, response, next) {
        // Set up validator for request input
        let validator = new Validator(request.body, {
            name: 'required',
            email: 'required|email',
            password: 'required|confirmed|min:6'
        });

        if (validator.passes()) {
            User.findOne({email: request.body.email})
                .exec()
                .then(user => {
                    if (user) {
                        return response.status(422).json({
                            errors: {
                               email: 'Email has already been registered'
                            }
                        });
                    }
                })
                .then(user => {
                    let userData = {
                        email: request.body.email,
                        name: request.body.name,
                        password: request.body.password
                    };

                    User.create(userData, function (error, user) {
                        if (error) {
                            error.status = 500;
                            return next(error);
                        } else {
                            let responseBody = {
                                status: 'success',
                                user: _.pick(user, ['name', 'email'])
                            }

                            return response.status(200).json(responseBody);
                        }
                    });
                })
                .catch(error => {
                    error.status = 500;
                    return next(error);
                });
        } else {
            response.status(422).json({
                errors: validator.errors.all()
            });
        }
    },

    /**
     * Verify user credentials and grant an authentication token
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {Object} next Next callable in chain
     */
    login (request, response, next) {
        // Testing
        return response.status(200).json({
            status: 'success',
            message: 'Log in successful'
        })
    }
}

module.exports = auth;