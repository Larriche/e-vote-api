const ElectionCandidate = require('../models/election_candidate');
const ElectionCategory = require('../models/election_category');
const Election = require('../models/election');
const Utilities = require('../services/utilities');
const fs = require('fs');
const path = require('path');

const candidates = {
    /**
     * Add a new candidate for an election
     *
     * @param {Object} request HTTP request
     * @param {Object} response HTTP response
     * @param {Function} next Next callable
     */
    async store(request, response, next) {
        try {
            let validationErrors = ElectionCandidate.validate(request.body);

            if (Object.keys(validationErrors).length) {
                return response.status(422).json({
                    errors: validationErrors,
                    status: 'failed'
                });
            }

            let errors = {};

            let election = await Election.find({_id: request.body.election_id, user: request.user.id}).exec();

            if (!election) {
                errors.election_id = ['No user-created election found with given ID'];
            }

            if (request.body.hasOwnProperty('categories') && request.body.categories.length) {
                let categories = request.body.categories;

                for (let categoryId of categories) {
                    let category = await ElectionCategory.find({_id: categoryId, election: request.body.election_id}).exec();

                    if (!category) {
                        errors.categories = ['Some categories are invalid for given election'];
                        break;
                    }
                }
            }

            if (Object.keys(errors).length) {
                return response.status(422).json({
                    errors,
                    status: 'failed'
                });
            }

            let candidateData = {
                name: request.body.name,
                election: request.body.election_id
            };

            let candidate = await ElectionCandidate.create(candidateData);

            if (request.body.hasOwnProperty('categories') && request.body.categories.length) {
                for (let categoryId of request.body.categories) {
                    let category = await ElectionCategory.findById(categoryId).exec();

                    candidate.categories.push(category);
                    candidate.save();
                }
            }

            candidate = await ElectionCandidate.findById(candidate._id).populate('election').populate('categories').exec();

            // Move candidate's uploaded avatar file to permanent storage
            if (Object.keys(request).indexOf('file') > -1) {
                let destFolder = path.join(__dirname, '../../uploads/candidate_images/');
                let newName = candidate._id + '.' + request.file.filename.split(".").pop();

                Utilities.moveUploadedFile(request.file, destFolder + newName, function() {
                    candidate.photo_url = 'uploads/candidate_images/' + newName;
                    candidate.save();

                    return response.status(200).json({
                        status: 'success',
                        candidate
                    });
                });
            } else {
                return response.status(200).json({
                    status: 'success',
                    candidate
                });
            }
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
}

module.exports = candidates;