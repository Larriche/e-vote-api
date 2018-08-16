const fixRequestBody = function (request, response, next) {
    request.body = JSON.parse(JSON.stringify(request.body));
    next();
};

module.exports = fixRequestBody;