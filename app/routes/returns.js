const express = require('express');
const auth = require('../middleware/auth');
const { Rental, validate } = require('../models/rentalModel');

const router = express.Router();

router.use(express.json());

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
});

module.exports = router;
