const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const mongoose = require('mongoose');

const app = express();

require('./app/startup/logging')();
require('./app/startup/routes')(app);
require('./app/startup/db')(mongoose);
require('./app/startup/config')();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
