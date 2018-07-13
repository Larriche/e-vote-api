'use strict';

const express = require("express");
const router = express.Router();
const middlewares = require('../middlewares');

const auth = require('../controllers/auth');
const elections = require('../controllers/elections');


function routes(router) {
    router.post('/auth/register', auth.register);
    router.post('/auth/login', auth.login);

    // Election Routes
    router.get('/elections', elections.index);
    router.post('/elections', elections.store);
    router.put('/elections/:id', elections.update);
}

const setupRouter = function (app) {
    // Set up middlewares on router
    middlewares(router);

    // Make router aware of our routes
    routes(router);

    app.use('/api/v1', router);
};

module.exports = setupRouter;
