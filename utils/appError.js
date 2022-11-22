class AppError extends Error {
  constructor(message, errCode) {
    super(message);
    this.code = errCode;
    // NOTE: if the error code is 4 then it is operational
    this.status = `${errCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
