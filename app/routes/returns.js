const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Movie } = require('../models/movieModel');
const { Rental, validateReturn } = require('../models/rentalModel');

const router = express.Router();

router.use(express.json());

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('No rental found.');
  if (rental.dateReturned) return res.status(400).send('Rental already processed.');

  rental.return();
  await rental.save();

  await Movie.update({ _id: rental.movie.id }, {
    $inc: { numberInStock: 1 },
  });

  return res.send(rental);
});

module.exports = router;
