const Validator = require('validatorjs');
const services = require('../services');
const Utilities = services.Utilities;
const ElectionCategory = require('../models/election_category');
const Election = require('../models/election');

const categories = {
    /**
    * Get elections category created by the currently authenticated user
    *
    * @param {Object} request  Http request
    * @param {Object} response Http response
    * @param {Object} next Next callable
    */
    async index(request, response, next) {
        let pagination = Utilities.getPaginationParams(request.query);
        let query = ElectionCategory.getQuery(request);
        let queryFilters = query.getQuery();

        try {
            let categories = await query.skip(pagination.skip).limit(pagination.limit).sort('-createdAt')
                .populate('election')
                .exec();

            let total = categories.length ? (await ElectionCategory.countDocuments(queryFilters).exec()) : 0;

            let responseData = {
                categories,
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
    },

    /**
     * Get election category with the given ID
     *
     * @param {Object} request Http request
     * @param {Object} response Http response
     * @param {Object} next The next callable
     */
    async show (request, response, next) {
        try {
            let category = await ElectionCategory.findById(request.params.id)
                .populate('election')
                .exec();

            if (!category) {
                return response.status(404).json({
                    status: 'failed',
                    message: 'Election category was not found'
                });
            } else {
                return response.status(200).json({
                    status: 'success',
                    category
                });
            }
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Update election category  with the given id
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    async update (request, response, next) {
        try {
            let category = await ElectionCategory.findById(request.params.id).exec();

            if (!category) {
                return response.status(404).json({
                    status: 'failed',
                    message: 'Election category was not found'
                });
            }

            let validationErrors = ElectionCategory.validate(request.body);

            if (Object.keys(validationErrors).length) {
                return response.status(422).json({
                    errors: validationErrors,
                    status: 'failed'
                });
            }

            let existingCategory = await ElectionCategory.findOne({
                    name: request.body.name,
                    election: request.body.election_id,
                    _id: { $ne: request.params.id }
                })
                .exec();

            if (existingCategory) {
                return response.status(422).json({
                    errors: {
                        name: ['Another election category with that name already exists']
                    },
                    status: 'failed'
                })
            }

            category = Object.assign(category, request.body);
            category.save();

            return response.status(200).json({
                status: 'success',
                category
            });
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
};

module.exports = categories;