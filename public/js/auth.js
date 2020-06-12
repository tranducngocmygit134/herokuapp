//
const catchAsycn = require('./../../utils/catchAsync');
exports.getSignup = (req, res, next) => {
  res.render('auth/signup');
};
exports.getLogin = (req, res, next) => {
  res.render('auth/login');
};
exports.getUpdate = (req, res, next) => {
  res.render('auth/update');
};
exports.postSignup = catchAsycn(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const result = await axios({
    method: 'POST',
    url: `http://127.0.0.1:3000/users/signup`,
    data: {
      // data send with request
      email,
      password,
      confirmPassword,
    },
  });
  //console.log(result);
  res.status(201).redirect('/users/login');
});
