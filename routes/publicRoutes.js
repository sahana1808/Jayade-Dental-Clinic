// routes/publicRoutes.js
const express = require('express');
const router = express.Router();

const publicCallbackController = require('../controllers/publicCallbackController');

// public callback endpoint (landing page)
router.post('/callback', publicCallbackController.createCallback);

// other public routes can be added here...

module.exports = router;
