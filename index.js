const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const express = require('express');
const genres = require('./app/routes/genres');
const customers = require('./app/routes/customers');
const movies = require('./app/routes/movies');
const rentals = require('./app/routes/rentals');
// const home = require('./app/routes/home');

const app = express();

mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true })
  .then(() => console.log('Connecting to MongoDB...'))
  .catch(() => console.log('Could not connect to MongoDB!'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals)
// app.use('/', home)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
