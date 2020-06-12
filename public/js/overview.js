const catchAsync = require('./../../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('overview/overview');
});
