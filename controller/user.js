// Dev module
const User = require('./../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAll = catchAsync(async (req, res, next) => {});

exports.getUpdate = (req, res, next) => {
  res.status(200).render('auth/update', {
    user: res.user,
  });
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1.Check user
  const filterObj = {
    email: req.body.email || req.user.email,
    name: req.body.name || 'Tran Duc Ngoc',
    date_of_birth: req.body.date_of_birth || '2000-01-01',
    gender: req.body.gender || req.user.gender,
    job: req.body.job || req.user.job,
    company: req.body.company || req.user.company,
    favorite: req.body.favorite || req.user.favorite,
    photo: req.body.photo || req.user.photo,
    country: req.body.country || req.user.country,
  };
  const user = await User.findByIdAndUpdate(req.user._id, filterObj, {
    new: true, // by defaut, findByIdAndUpdate return the doc before update, set new : true to return the doc after update
    runvalidators: true, // validator is off by default
  });
  if (!user) {
    const message = `Please login to continue`;
    return next(new AppError(401, message)); // unauthenticated
  }
  res.status(200).redirect('/users/update');
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  //console.log(req.user._id);
  if (!user) {
    const message = 'Please login to continue';
    return next(new AppError(401, message));
  }
  res.status(200).json({
    status: 'success',
    message: 'user is deleted',
  });
});
