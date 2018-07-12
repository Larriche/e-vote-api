const config = process.env;
const jwt = require('jsonwebtoken');
const secret = config.SECRET.toString().trim();

const verifyAuthentication = function (req, res, next) {
    let authExemptedRoutes = ['/auth/login', '/auth/register'];

    if (authExemptedRoutes.indexOf(req.path) > 0) {
        next();
    }

    var authorization = req.headers['authorization'] ? req.headers['authorization'] : req.headers['Authorization'];

    if (!authorization) return res.status(401).json({ auth: false, message: 'No token provided.' });

    var tokenParts = authorization.split(' ');
    var token = tokenParts[tokenParts.length - 1];

    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, secret, function (err, decoded) {
        if (err) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
    });

    next();
};

module.exports = verifyAuthentication;
