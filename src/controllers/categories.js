const Validator = require('validatorjs');
const services = require('../services');
const Utilities = services.Utilities;
const ElectionCategory = require('../models/election_category');
const Election = require('../models/election');

const categories = {
    /**
     * Create a new election category
     *
     * @param {Object} request Http request object
     * @param {Object} response Http response
     * @param {Object} next The next callable
     */
    store (request, response, next) {
        let validationErrors = ElectionCategory.validate(request.body);

        if (Object.keys(validationErrors).length) {
            return response.status(422).json({
                errors: validationErrors,
                status: 'failed'
            });
        }

        let data = {
            name: request.body.name,
            election: request.body.election_id
        };

        let createdCategory;

        ElectionCategory.findOne({name: request.body.name, election: request.body.election_id})
            .then(electionCategory => {
                if (electionCategory) {
                    let error = new Error();

                    error.status = 422;
                    error.errors = {
                        name: ['An election category with that name already exists']
                    };

                    return Promise.reject(error);
                } else {
                    return ElectionCategory.create(data);
                }
            })
            .then(category => {
                createdCategory = category;
                return Election.findById(request.body.election_id);
            })
            .then(election => {
                if (election) {
                    election.categories.push(createdCategory);
                    election.save();
                }

                return ElectionCategory.findOne({ _id: createdCategory.id }).populate('election');
            })
            .then(category => {
                let responseData = {
                    category,
                    status: 'success'
                };

                return response.status(200).json(responseData);
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
    }
};

module.exports = categories;