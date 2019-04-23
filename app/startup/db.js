const winston = require('winston');
const config = require('config');

module.exports = function (mongoose) {
  const db = config.get('db');
  mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log(`Connecting to ${db}...`))
    .catch(() => console.log(`Could not connect to ${db}!`));
};
