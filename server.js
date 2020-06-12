const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
let DBString = process.env.DB;
const DB = DBString.replace('<password>', process.env.DB_PASSWORD);
const local_db = process.env.DB;
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB is connected');
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
