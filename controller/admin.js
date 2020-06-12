// Dev package
const catchAsync = require('../utils/catchAsync');
const User = require('./../model/user');
exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find(); // if no users, this isn't error every thing is correct
  res.status(200).json({
    status: 'success',
    data: {
      data: users,
    },
  });
});
exports.getAbout = (req, res, next) => {
  res.status(200).render('overview/about');
};
