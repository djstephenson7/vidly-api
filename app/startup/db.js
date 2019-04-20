const winston = require('winston');

module.exports = function(mongoose) {
  mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true })
    .then(() => console.log('Connecting to MongoDB...'))
    .catch(() => console.log('Could not connect to MongoDB!'));
};
