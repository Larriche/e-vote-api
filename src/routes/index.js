'use strict';

const express = require("express");
const router = express.Router();

const auth = require('../controllers/auth');

// Authentication
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);

module.exports = router;
