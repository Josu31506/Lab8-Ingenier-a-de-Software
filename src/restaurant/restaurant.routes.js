const express = require('express');
const restaurantController = require('./restaurant.controller');

const router = express.Router();

router.post('/dinners', restaurantController.registerDinner);

module.exports = router;
