// connect to DB

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const Tour = require(`${__dirname}/../../models/tourModel`);

dotenv.config({ path: `${__dirname}/../../config.env` });

const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connection successful');
  });

// TODO: Send data to DB
// extract data from tour-simple.json
// transform the data
// push the data to the DB

const importDataToDB = async () => {
  try {
    const tours = JSON.parse(
      fs.readFileSync('./tours-simple.json', 'utf-8')
    ).map((tour) => {
      delete tour.id;
      return tour;
    });

    await Tour.create(tours);
    process.exit(0);
  } catch (err) {
    console.log(`Process end at error type: ${err}`);
    process.exit(1);
  }
};

const deleteDataInDB = async () => {
  try {
    await Tour.deleteMany({});
    process.exit(0);
  } catch (err) {
    console.log(`Process end at error type: ${err}`);
    process.exit(1);
  }
};

// Delete all the data in DB

if (process.argv[2] === '--importToDB') {
  importDataToDB();
}

if (process.argv[2] === '--deleteAll') {
  deleteDataInDB();
}
