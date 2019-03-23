const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const genres = require('./app/routes/genres');
const home =  require('./app/routes/home');
const debug = require('debug')('app:startup');

const app = express();

mongoose.connect('mongodb://localhost/genres', { useNewUrlParser: true })
.then(() => console.log('Connecting to MongoDB...'))
.catch(() => console.log('Could not connect to MongoDB!'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/genres', genres)
// app.use('/', home)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
