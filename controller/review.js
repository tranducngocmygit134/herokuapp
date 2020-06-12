// Dev package
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('./../model/review');

// Export module
exports.getAllReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      data: reviews,
    },
  });
});
