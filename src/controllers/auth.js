const auth = {
    /**
     * Sign a user up
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {Object} next Next callable in chain
     */
    register (request, response, next) {
        // Testing
        return response.status(200).json({
            status: 'success',
            message: 'Registration successful'
        });
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