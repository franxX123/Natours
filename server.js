const mongoose = require('mongoose');
const dotenv = require('dotenv');
// NOTE: configure env variables first before letting the app use import
// otherwise, app will use the unmodified version instead of the newly configured
// env variables.
dotenv.config({ path: `${__dirname}/config.env` });

const app = require(`${__dirname}/app`);

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
  .then((con) => {
    console.log('Connection successful');
  });

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`We are running ${port}`);
});

// global unhandled error handler
// NOTE: We created a listener that subscribes to the event
// and invoked the callback provided
// NOTE: "unhandledRejection" happens when a rejected asynchronous
// call is made and there are no catch blocks to handle it.
process.on('unhandledRejection', (err) => {
  // Means exit gracefully, not abruptly
  console.log(`error name: ${err.name}, error message: ${err.message}`);
  console.log('Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// NOTE: use this when we have some synchronous unhandled error or exceptions
// like using an unknown variable, calling a non-existing functino, etc
// NOTE: we need to declare this in the very beginning since
// we want to cover as much code after for it to cover.
process.on('uncaughtException', (err) => {
  console.log(`error name: ${err.name}, error message: ${err.message}`);
  console.log('Shutting down...');
  process.exit(1);
});

console.log(x);
