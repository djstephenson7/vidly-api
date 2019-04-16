const express = require('express');
const { Genre, validate } = require('../models/genreModel');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/async');

const router = express();

router.use(express.json());

router.get('/', asyncMiddleware(async (req, res) => {
  res.send(await Genre.find().sort('genre'));
}));

router.post('/', auth, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = new Genre({ genre: req.body.genre });
  genre = await genre.save();
  res.send(genre);
}));

router.put('/:id', asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(req.params.id, { genre: req.body.genre }, {
    new: true,
  });

  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
}));

router.delete('/:id', [auth, admin], asyncMiddleware(async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
}));

router.get('/:id', asyncMiddleware(async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
}));

module.exports = router;
