const express = require('express');
const mongoose = require('mongoose');

const app = express();

require('./app/startup/logging')();
require('./app/startup/routes')(app);
require('./app/startup/db')(mongoose);
require('./app/startup/config')();
require('./app/startup/validation')();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
