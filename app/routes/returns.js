const express = require('express');
const auth = require('../middleware/auth');
const { Rental, validate } = require('../models/rentalModel');

const router = express.Router();

router.use(express.json());

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId,
  });

  if (!rental) return res.status(404).send('No rental found.');
  if (rental.dateReturned) return res.status(400).send('Rental already processed.');

  rental.dateReturned = new Date();
  rental.save();
  return res.status(200).send();
});

module.exports = router;
