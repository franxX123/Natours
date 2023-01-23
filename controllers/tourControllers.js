const Tour = require(`./../models/tourModel`);
const APIFeatures = require(`./../utils/apiFeatures`);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports.getTourAlias = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: 5,
    sort: 'price,ratingAverage',
    fields: 'price,ratingAverage,summary,duration,difficulty',
  };
  next();
};

module.exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

module.exports.getTour = catchAsync(async (req, res, next) => {
  // NOTE: req.params.id allows us to access the query parameters
  // in the url used to get a specific tour
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    throw new AppError(`No tour found for the tour ID ${req.params.id}`, 404);
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

module.exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

module.exports.updateTour = catchAsync(async (req, res, next) => {
  // method params: id, data used to update the tour of id, options (like return the new tour or use a validator)
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // this allows us to run validators when we are updating.
    runValidators: true,
  });

  if (!tour) {
    throw new AppError(`No tour found for the tour ID ${req.params.id}`, 404);
  }

  res.status(201).json({
    status: 'success',
    message: '<Update successful...>',
    tour: tour,
  });
});

module.exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    throw new AppError(`No tour found for the tour ID ${req.params.id}`, 404);
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

// IMPORTANT: The aggregate function allows us to describe some statistics regarding the
// groups indicated by the "filters" or "stages" or "queries" in the aggregation pipeline.
module.exports.getTourStats = catchAsync(async (req, res, next) => {
  // RECALL: when creating a stage, the function must take the form
  // {
  //   $functionName: 'attributeName'
  // }, eg. {$gte: 4.6}
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        aveRating: { $avg: '$ratingAverage' },
        avePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      // NOTE: schema indicated names like "ratingQuantity" is no longer available
      // NOTE: $sort: {attributeName from previous stage: 1 = ascending}
      $sort: { avePrice: 1 },
    },

    {
      $match: {
        _id: { $ne: 'HARD' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

module.exports.getMonthlyTours = catchAsync(async (req, res) => {
  const year = req.params.year;

  // Sample Test
  // if (year < 1970) {
  //   throw new AppError(
  //     'Monthly tours for a given year must be greater than 1970',
  //     404
  //   );
  // }

  const monthly = await Tour.aggregate([
    // NOTE: unwind allows us to destructure an array and
    // produce a copy of the tour for each item in the array.
    {
      $unwind: '$startDates',
    },
    // NOTE: we obtain the tours that occured in the specified year
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: {
          // NOTE: push allows us to create and push to an array
          $push: '$name',
        },
      },
    },

    {
      $addFields: {
        month: '$_id',
      },
    },

    {
      $project: {
        // NOTE: by default all attributes are included (1). Otherwise, 0
        _id: 0,
      },
    },

    {
      $sort: { numToursStarts: -1 },
    },

    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    status: 'success',
    length: monthly.length,
    data: { monthly },
  });
});
