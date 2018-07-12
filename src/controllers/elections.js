const elections = {
    index (request, response, next) {
        console.log(request.jwt_decoded);

        return response.status(200).json({
            status: 'success',
            elections: []
        });
    }
};

module.exports = elections;