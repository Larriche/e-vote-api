'use strict';

const express = require("express");
const router = express.Router();
const middlewares = require('../middlewares');

const auth = require('../controllers/auth');
const elections = require('../controllers/elections');
const categories = require('../controllers/categories');


function routes(router) {
    router.post('/auth/register', auth.register);
    router.post('/auth/login', auth.login);

    // Election Routes
    router.get('/elections', elections.index);
    router.post('/elections', elections.store);
    router.get('/elections/:id', elections.show);
    router.put('/elections/:id', elections.update);
    router.delete('/elections/:id', elections.destroy);

    // Election category routes
    router.get('/elections/:election_id/categories', categories.index);
    router.post('/election_categories', categories.store);
    router.get('/election_categories/:id', categories.show);
    router.put('/election_categories/:id', categories.update);
    //router.delete('/election_categories/:id', categories.destroy);
}

const setupRouter = function (app) {
    // Set up middlewares on router
    middlewares(router);

    // Make router aware of our routes
    routes(router);

    app.use('/api/v1', router);
};

module.exports = setupRouter;
