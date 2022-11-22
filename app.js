const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');

const morgan = require('morgan');
const routerTour = require('./routes/tourRoutes');
const routerUser = require('./routes/userRoutes');

const app = express();

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   req.requestedAt = new Date().toISOString();
//   next();
// });

// Mounting Routes using router MiddleWares
app.use('/api/v1/tours', routerTour);
app.use('/api/v1/users', routerUser);

// NOTE: for all verbs concerning all the routes, if they weren't handled by the previous middleware
// then simply send an error message.
app.all('*', (req, res, next) => {
  const error = new AppError(
    `The url ${req.originalUrl} does not exists.`,
    404
  );
  next(error);
});

// NOTE: Difference between error and fail is that "error" means there was something that
// went wrong in the code and is outside the programmer's control,
// and "fail" means there was some error that we expected would happen

app.use(globalErrorHandler);

module.exports = app;
