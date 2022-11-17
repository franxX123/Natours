const express = require('express');

const morgan = require('morgan');
const routerTour = require('./routes/tourRoutes');
const routerUser = require('./routes/userRoutes');

const app = express();

// NOTE: This takes the data that came with the req and adds it to the body of req

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

// Mounting Routes using router MiddleWares
app.use('/api/v1/tours', routerTour);
app.use('/api/v1/users', routerUser);

module.exports = app;
