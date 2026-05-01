const express = require('express');
const router = express.Router();
const { getPublicOverview } = require('../controllers/stats.controller');

router.get('/overview', getPublicOverview);

module.exports = router;
