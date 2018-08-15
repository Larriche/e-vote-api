const candidates = {
    async store(request, response, next) {
        return response.status(200).json({});
    }
}

module.exports = candidates;