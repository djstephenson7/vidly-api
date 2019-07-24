const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
require("./app/startup/logging")();
require("./app/startup/routes")(app);
require("./app/startup/db")(mongoose);
require("./app/startup/config")();
require("./app/startup/validation")();
require("./app/startup/prod")(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = server;
