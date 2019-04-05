const _ = require('lodash');
const express = require('express');
const { User, validate } = require('../models/userModel');
const mongoose = require('mongoose');

const router = express();

router.use(express.json());

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  await user.save();

  res.send(_.pick(user, ['name', 'email']));
});

module.exports = router;
