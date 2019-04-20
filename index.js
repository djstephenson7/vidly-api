const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const app = express();

require('./app/startup/logging')();
require('./app/startup/routes')(app);
require('./app/startup/db')(mongoose);

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL: jwtPrivateKey is not defined');
  process.exit(1);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
