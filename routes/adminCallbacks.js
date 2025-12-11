// routes/adminCallbacks.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/callbackController');

// ---- OPTIONAL: add your auth middleware here ----
// const { isAdmin } = require('../middleware/auth');
// Use isAdmin to protect routes if you have it

// List callbacks (admin)
router.get('/', /* isAdmin, */ controller.getAllCallbacks);

// Mark contacted
router.patch('/:id/contacted', /* isAdmin, */ controller.markCallbackContacted);

// Delete callback
router.delete('/:id', /* isAdmin, */ controller.deleteCallback);

module.exports = router;
