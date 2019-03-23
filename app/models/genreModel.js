const mongoose = require('mongoose');

const Genre = new mongoose.model('Genre', new mongoose.Schema({
  genre: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
}));
