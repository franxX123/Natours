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
app.listen(port, () => {
  console.log(`We are running ${port}`);
});
