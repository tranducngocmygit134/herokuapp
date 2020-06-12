// Third package
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Dev module
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendMail = require('../utils/nodemailer');

exports.getSignup = (req, res, next) => {
  res.status(200).render('auth/signup');
};
exports.signup = catchAsync(async (req, res, next) => {
  // destructering
  const { name, email, password, confirmPassword } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });
  sendToken(user, 200, res);
  res.status(201).redirect('auth/login');
});
exports.getLogin = (req, res, next) => {
  res.status(200).render('auth/login');
};
exports.login = catchAsync(async (req, res, next) => {
  // 1. Check if email and password is put
  const { email, password } = req.body;
  if (!email || !password) {
    const statusCode = 400;
    const message = `Please tell us email and password`;
    return next(new AppError(statusCode, message));
  }
  // 2.Check if email and password is correct (check in DB)
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    const statusCode = 401; // 401: unauthenticated
    const message = `Please provide correct email or password`;
    return next(new AppError(statusCode, message));
  }
  // 3. All is correct
  sendToken(user, 200, res);
  res.status(200).redirect('/');
});
exports.getLogout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true, // can't manipulate in browser
  });
  res.status(200).redirect('/users/login');
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1.Check if exist token
  let token;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1]; // get token
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    const statusCode = 401; // unauthenticated
    const message = `Please log in to continue`;
    return next(new AppError(statusCode, message));
  }
  // 2.Verify token
  const decode = jwt.verify(token, process.env.JWT_SECRET); // return payload (id)
  // 3. Check if user still exist
  const userExist = await User.findById(decode.id);
  if (!userExist) {
    const statusCode = 401; // unauthenticated
    const message = `The token belong to this user is no longer exist`;
    return next(new AppError(statusCode, message));
  }
  // 4. Check if user no change password
  const checkChangePassword = userExist.changedPasswordAfter(decode.iat);
  if (checkChangePassword) {
    const message = `Password has been changed. Please login again`;
    return next(new AppError(401, message));
  }
  // 5.Sign user to req
  res.user = userExist;
  next();
});
exports.restrictTo = function (...option) {
  // to user req, res, next in function
  return (req, res, next) => {
    if (!option.includes(req.user.role)) {
      const message = `You don't have permission to perform this action`;
      return next(new AppError(402, message));
    }
    next();
  };
};
// Reset password
// 1. forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // 1.Check if no exist email in body
  if (!email) {
    const message = `Please tell us our email`;
    return next(new AppError(400, message)); // Bad request
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    const message = `There is no user with email address`;
    return next(new AppError(400, message));
  }
  // 2.Generate the random reset token
  const resetToken = user.createPasswordResetToken(); // get reset token and assign reset token hash, expires token to DB
  user.save({ validateBeforeSave: false }); // validate false because we save and not change password
  // 3.Send it to user's email
  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to ${url}.\nIf you didn't forget your password, please ignore this email!`;
    await sendMail({
      email: user.email,
      subject: 'Your password reset token(valid in 10min)',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Token send to your email. Please check your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }
});
// 2. Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  // 1.Get user from resetToken
  const resetToken = req.params.resetToken; // get token from link in email
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //hash token to compare with token store in DB use algo sha256
  // 2.Check if token has not expired and correct user => changed password
  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    const message = `Invalid token or token expired. Please try again`;
    return next(new AppError(400, message));
  }
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3.Change changedPasswordAt

  // 4.Log user in.Send JWT
  sendToken(user, 200, res);
});
// Update password
exports.update = catchAsync(async (req, res, next) => {
  // 1. Get user from collection
  const user = await User.findById(req.user._id).select('+password'); // update only come then protected middleware
  // 2.Check if POSTed current password is correct
  const { currentPassword, newPassword, confirmPassword } = req.body; // get password send from client
  if (!newPassword || !confirmPassword || !currentPassword) {
    const message = 'Please tell us your password and confirm it';
    return next(new AppError(400, message));
  }
  const checkPassword = await user.checkPassword(
    currentPassword,
    user.password
  );
  // 3. If true, update password
  if (!checkPassword) {
    const message = `Password is not correct, please try again`;
    return next(new AppError(401, message)); // unauthenticated
  }
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save(); // middleware will check for confirm password and changePasswordAt is udpate
  // await user.findByIdAndUpdate() will not work for validate and document middleware
  // 4. Log user in, send JWT
  sendToken(user, 200, res);
});
exports.getUser = (req, res, next) => {
  const user = req.user;
  next();
};

// Dev function
const signToken = function (id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};
const sendToken = function (user, statusCode, res) {
  const token = signToken(user._id);
  const cookieOptions = {
    //secure: true, only for https
    httpOnly: true, // browser can't change cookie, => xss
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRESIN * 24 * 3600 * 1000
    ),
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.expires = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  //res.status(statusCode).json({
  //  status: 'success',
  //  token,
  //  data: {
  //    data: user,
  //  },
  //});
};
