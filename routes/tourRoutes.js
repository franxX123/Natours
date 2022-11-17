const express = require('express');

const {
  getTourAlias,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyTours,
} = require(`${__dirname}/../controllers/tourControllers`);

// ROUTES TOURS
// Mounting our Routes instead of app.use('url', RouterName)
// Create a middleware => create Router and add-on functionalities
// Use middleware
const router = express.Router();

// IMPORTANT: app.route()... isn't the same as the using the
// Router().route()... , it is not a middleware

// router.param('id', checkId);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyTours);
router.route('/top-5-cheap').get(getTourAlias, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// app.use('/api/v1/tours', router);

module.exports = router;
