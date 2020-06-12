// Dev module
const AppError = require('../utils/appError');
// exports module
exports.PageNotFound = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Something went very wrong',
  });
};
exports.GlobalHandleError = (err, req, res, next) => {
  // express
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'error';
  if (process.env.NODE_ENV === 'development') {
    // handle error for dev
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // handle error for product
    let error = { ...err }; // if no condition is true, error = err
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWT();
    if (err.name === 'TokenExpiredError') error = handleTokenExpired();
    sendErrorProd(error, res);
  }
};
//
// **
// **
// function handle error
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    name: err.name,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      message: `Something went very wrong`,
    });
  }
};
// Function handle for development
const handleCastError = (err) => {
  const message = `Invalid path: ${err.path} for value: ${err.value}`;
  return new AppError(400, message); // bad request
};
const handleJWT = () => {
  const message = `Invalid token. Please login again`;
  return new AppError(401, message); // unauthenticated
};
const handleTokenExpired = () => {
  const message = `Token expired. Please login again`;
  return new AppError(401, message);
};
