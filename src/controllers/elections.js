const elections = {
    index (request, response, next) {
        return response.status(200).json({
            status: 'success',
            elections: []
        });
    }
};

module.exports = elections;