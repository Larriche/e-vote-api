const verifyAuthentication = require('./verify_authentication');
const fileUploader = require('./file_uploader');
const fixBody = require('./fix_request_body');

const useMiddleware = function (routes, middleware) {
    let exemptedRoutes = routes.except ? routes.except : [];
    let onlyRoutes = routes.only ? routes.only : [];

    return function (req, res, next) {
        let path = req.path;

        if (exemptedRoutes.length) {
            if ((exemptedRoutes.indexOf(path) >= 0)) {
                return next();
            } else {
                return middleware(req, res, next);
            }
        } else if (onlyRoutes.length) {
            if (onlyRoutes.indexOf(path) < 0) {
                return next();
            } else {
                return middleware(req, res, next);
            }
        } else {
            return middleware(req, res, next);
        }
    };
};

const setUp = function(router) {
    // Authentication middleware
    router.use(useMiddleware({
        except: ['/auth/login', '/auth/register']
    }, verifyAuthentication));

    // Extract uploaded candidate photo and store in app temp storage
    router.use(useMiddleware({
        only: ['/candidates']
    }, fileUploader.single('candidate_photo')));

    // Fix 'request.body' on routes that passed through form data parsing
    router.use(useMiddleware({
        only: ['/candidates']
    }, fixBody));
}

module.exports = setUp;