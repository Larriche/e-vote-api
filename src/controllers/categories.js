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
    async store (request, response, next) {
        let validationErrors = ElectionCategory.validate(request.body);

        if (Object.keys(validationErrors).length) {
            return response.status(422).json({
                errors: validationErrors,
                status: 'failed'
            });
        }

        try {
            let data = {
                name: request.body.name,
                election: request.body.election_id
            };

            let createdCategory;

            let existingCategory = await ElectionCategory.findOne({
                    name: request.body.name,
                    election: request.body.election_id
                }).exec();

            if (existingCategory) {
                return response.status(422).json({
                    errors: {
                        name: ['An election category with that name already exists']
                    }
                });
            }

            let category = await ElectionCategory.create(data);

            let election = await Election.findById(request.body.election_id).exec();
            election.categories.push(category);
            election.save();

            category = await ElectionCategory.findOne({ _id: category.id }).populate('election').exec();

            let responseData = {
                category,
                status: 'success'
            };

            return response.status(200).json(responseData);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
};

module.exports = categories;