'use strict';

const express = require("express");
const router = express.Router();
const middlewares = require('../middlewares');

const auth = require('../controllers/auth');
const elections = require('../controllers/elections');

// Authentication
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);

// Election Routes
router.get('/elections', elections.index);

const setupRouter = function (app) {
    // Set up middlewares on router
    middlewares(router);

    app.use('/api/v1', router);
};

module.exports = setupRouter;
