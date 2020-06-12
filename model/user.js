// Third package
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Dev module
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please tell us your correct email'],
  },
  password: {
    type: String,
    required: [true, 'Please tell us your password'],
    minlength: [8, 'Password must be greater than 8 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // validate only work for save and create
      validator: function (el) {
        return el === this.password;
      },
      message: `Please confirm your password`,
    },
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
  date_of_birth: {
    type: Date,
    default: '2000-01-01',
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác'],
    default: 'Khác',
  },
  country: {
    type: String,
    maxlength: [16, 'Vui lòng tóm tắt dưới 16 ký tự'],
    default: 'Chưa cập nhật',
  },
  job: {
    type: String,
    maxlength: [16, 'Vui lòng tóm tắt dưới 16 ký tự'],
    default: 'Chưa cập nhật',
  },
  company: {
    type: String,
    maxlength: [16, 'Vui lòng tóm tắt dưới 16 ký tự'],
    default: 'Chưa cập nhật',
  },
  favorite: {
    type: String,
    maxlength: [16, 'Vui lòng tóm tắt dưới 16 ký tự'],
    default: 'Chưa cập nhật',
  },
  photo: {
    type: String,
    default:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT7rFj0ggqO1s8Jj8pM8n_W78dYvaTMCPgGshr5KSSXcTERvHgm&usqp=CAU',
  },
  changedPasswordAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Middleware
userSchema.pre('save', async function (next) {
  //hash password and make confirmPassword disappear
  if (!this.isModified('password')) return next(); // if password is not modified => next
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) next(); // if password is not modified is document is create action => next
  this.changedPasswordAt = Date.now() - 1000; // sometime this action slow in issuing JWT => this is a hack
  next();
});
userSchema.pre(/^find/, function (next) {
  // this point to the current query
  this.find({ active: { $ne: false } });
  this.select(' -role -active -changedPasswordAt -__v');
  next();
});

// Model methods
userSchema.methods.checkPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  // To use this keyword, use annonymous function
  if (this.changedPasswordAt) {
    const changedTimeStamp = this.changedPasswordAt.getTime() / 1000; // ms => s
    return JWTTimeStamp < changedTimeStamp; // JWTTimeStamp is time token issued
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //random 32 bytes,convert to hex
  this.passwordResetToken = crypto
    .createHash('sha256') // algorithm sha256
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken; // send to email then compare with resetToken in DB
};

module.exports = mongoose.model('User', userSchema);
