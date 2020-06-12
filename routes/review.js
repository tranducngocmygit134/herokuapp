// Third package
const express = require('express');
const router = express.Router();
// Dev package
const reviewController = require('./../controller/review');

router.route('/').get(reviewController.getAllReview);

// exports
module.exports = router;
