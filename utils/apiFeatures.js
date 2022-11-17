class APIFeatures {
  constructor(query, responseQuery) {
    this.query = query;
    this.responseQuery = responseQuery;
  }

  filter() {
    // 1A.) Filtering
    // Find all the tours using the parameters indicated in the request
    const toursObj = { ...this.responseQuery };

    const excludedFields = ['limit', 'sort', 'fields', 'page'];
    excludedFields.forEach((field) => delete toursObj[field]);

    // 1B.) Advanced Filtering
    // NOTE: For mongoose we use the form {attribute1: value, attribute2: { $comparisonOperator: value} } to pass as an argument
    // to a mongoose query method.
    const tourStr = JSON.stringify(toursObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matched) => `$${matched}`
    );

    // console.log(JSON.parse(tourStr));
    this.query = this.query.find(JSON.parse(tourStr));

    return this;
  }

  sort() {
    // 2.) Sorting: Sorts by a given attribute
    if (this.responseQuery.sort) {
      const sortBy = this.responseQuery.sort.split(',').join(' ');
      // NOTE: query.sort() allows us to sort by giving an object
      // of the form {attributeName1 attributeName2 ...}
      this.query = this.query.sort(sortBy);
    } else {
      // we want in descending order to make sure we see the latest
      // tours added.
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitingFields() {
    // 3.) Field Limiting: Allows us to specify the fields we want to
    // show and ones we don't want to show (-"attributeName"). This is
    // done to reduce bandwidth

    if (this.responseQuery.fields) {
      const fields = this.responseQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // NOTE: "-" means include everything except "__v"
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4.) Pagination: Uses the parameters page and limit. This determines
    // how many tours we can put in each page.
    const page = +this.responseQuery.page || 1;
    const limit = +this.responseQuery.limit || 50;
    const skippedTours = (page - 1) * limit;

    this.query = this.query.skip(skippedTours).limit(limit);

    // NOTE: We REMOVED because this returns 0 tours when the # of pages
    // requested is more than what is necessary, which is correct.

    // Checks if the number of pages indicated is valid
    // if (this.responseQuery.page) {
    //   // NOTE: Tour.countDocuments() allows us to get the total number of tours
    //   const numTours = await Tour.countDocuments();
    //   const expectedNumPages = Math.ceil(numTours / limit);
    //   // console.log(expectedNumPa0ges);
    //   if (expectedNumPages < +this.responseQuery.page) {
    //     throw new Error('Invalid number of pages indicated');
    //   }
    // }

    return this;
  }
}

module.exports = APIFeatures;
