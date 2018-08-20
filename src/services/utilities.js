const queryString = require('query-string');
const path = require('path');
const fs = require('fs-extra');

const Utilities = {
    /**
     * Get params to be used for resource listing pagination
     *
     * @param {Object} requestData Data from a get request
     * @return {Object} queryParams Constructed query params
     */
    getPaginationParams (requestData) {
        let pagination = {
            skip: 0,
            limit: 0
        };

        if (requestData.hasOwnProperty('per_page')) {
            let perPage = Number(requestData.per_page);
            let page = requestData.hasOwnProperty('page') ? Number(requestData.page) : 1;

            pagination.limit = perPage;

            if (requestData.hasOwnProperty('page')) {
               pagination.skip = (page - 1) * perPage;
            }
        }

        return pagination;
    },

    /**
     * Fix pagination details onto a listing that is paginated
     *
     * @param {Object} request The HTTP request
     * @param {Object} responseData Data about to be sent as a response
     * @param {Integer} total Total number of resources
     */
    setPaginationFields (request, responseData, total) {
        if (!request.query.hasOwnProperty('per_page')) {
            return responseData;
        }

        let params = request.query;
        let currPage = params.hasOwnProperty('page') ? Number(params.page) : 1;
        let perPage = Number(params.per_page);

        let nextPageParams = Object.assign({}, params, {page: currPage + 1});
        let lastPageParams = Object.assign({}, params, {page: currPage - 1});

        let fullUrl = request.protocol + '://' + request.get('Host') + request.originalUrl.split("?").shift() + "?";
        let lastPageUrl = fullUrl + queryString.stringify(lastPageParams);
        let nextPageUrl = fullUrl + queryString.stringify(nextPageParams);

        responseData.pagination_details = {
            per_page: perPage,
            curr_page: currPage,
            total: total
        };

        if (currPage > 1) {
            responseData.pagination_details.last_page_url = lastPageUrl;
        }

        if (total - (currPage * perPage) > 0) {
            responseData.pagination_details.next_page_url = nextPageUrl;
        }

        return responseData;
    },

    /**
     * Move file that has been temporarily uploaded into its final destination
     *
     * @param {Object} file File object after upload by multer
     * @param {String} finalDestination Path for file's resting place
     * @param {Function} callback Callback after file move operation
     */
    moveUploadedFile (file, finalDestination, callback) {
        let oldPath = file.path;

        fs.rename(oldPath, finalDestination, callback);
    },

    /**
     * Do certain initializations on the app such as creating needed storage folders
     *
     */
    boot() {
        let candidatePhotosDir = path.join(__dirname, '../../public/uploads/candidate_images/');

        fs.ensureDirSync(candidatePhotosDir);
    },

    generateFileUrl(filePath) {
        let server = process.env.APP_URL;
        let port = process.env.PORT;

        if (!filePath) {
            return '';
        }

        return server + ':' + port + '/' + filePath;
    }
};

module.exports = Utilities;