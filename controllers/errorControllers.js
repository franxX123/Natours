const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `The tour name '${err.keyValue.name}' already exists`;
  return new AppError(message, 400);
};

const handleValidatorErrorDB = (err) => {
  // gets the field that violated the validator
  // const field = Object.keys(err.errors);
  const errors = Object.keys(err.errors).map(
    (field) => `${err.errors[field].message}`
  );

  const message = errors.join('. ');
  return new AppError(message, 400);
};

const errMessageDev = (err, res) => {
  // NOTE: we have a ternary to make sure the error code
  // is valid (i.e 200, 400, or 500)
  res.status(err.isOperational ? err.code : 500).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const errMessageProd = (err, res) => {
  // NOTE: Show details about the operational errors and generic details when the

  if (err.isOperational) {
    // 1.) Send message about the status
    res.status(err.code).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 1.) Don't leak any info
    console.error(err);
    // 2.) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Error 500: Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.code = err.code || 500;
  err.status = err.status || 'error';

  // Development errors
  if (process.env.NODE_ENV === 'development') {
    errMessageDev(err, res);
  }

  // Production errors
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // Handle the database errors for production
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateErrorDB(err);
    if (err.code === 500) error = handleValidatorErrorDB(err);
    errMessageProd(error, res);
  }
};
