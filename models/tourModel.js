const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name is required'],
      unique: true,
      maxlength: [30, 'Tour name should at most have 30 characters'],
      minlength: [10, 'Tour name should at least have 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour max group size is required'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour difficulty is required'],
      // Validators
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Tour difficulty must be either: easy, medium, or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour should have a rating of at least 1.0'],
      max: [5, 'Tour should have a rating of at most 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour price is required'],
    },
    priceDiscount: {
      type: Number,
      // NOTE: This is only used upon NEW document creation, not on update or anything else
      validate: {
        // Receives the value of priceDiscount
        validator: function (value) {
          // this refers to the document we have
          return value < this.price;
        },
        // The VALUE keyword allows us to access this attribute
        // whenever.
        message: 'Discount price ({VALUE}) must be below the regular price.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour summary is required'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Tour description is required'],
    },
    imageCover: {
      type: String,
      required: [true, 'Tour image cover is required'],
    },
    images: {
      type: [String],
      required: [true, 'Tour images are required'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
    },

    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// NOTE: Use virtual property to infer new data from the current data
// and to include it to the response, we simply add to
// the schema as an additional parameter
// { toJSON: {virtuals: true}, toObject: {virtuals:true} }
tourSchema.virtual('durationWeeks').get(function () {
  // IMPORTANT: use actual function instead of an arrow, since the
  // the actual function has a designated (lexical) this keyword
  // and since function is used by a document (which has the attributes)
  // specified in the schema
  return this.duration / 7;
});

// NOTE: pre and post iddlewares allow us to invoke callbacks
// before or after a record is added to the database (events like 'create'
// and 'save').
// IMPORTANT: "pre" middlewares have access to next function
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// IMPORTANT: post has access to the document saved and
// the next function. We are no longer using the this keyword
// to call the callback, because we already get the document
// as an argument

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query MIddleware:
// Happens before the query results are sent to the client
tourSchema.pre(/^find/, function (next) {
  // NOTE: the "this" keyword refers a query object.
  //
  this.find({
    secretTour: {
      $ne: true,
    },
  });
  this.start = Date.now();

  next();
});

// This happens after the query has been sent to the client
tourSchema.post(/^find/, function (docs, next) {
  console.log(`The runtime is ${Date.now() - this.start} seconds`);
  next();
});

// Aggregation Tours
tourSchema.pre('aggregate', function (next) {
  // NOTE: the pipeline shows the aggregation pipeline we created
  // in tourControllers, and we are simply adding another stage to
  // filter our the secretTours
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
