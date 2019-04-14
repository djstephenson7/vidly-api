const express = require('express');
const { Genre, validate } = require('../models/genreModel');
const auth = require('../middleware/auth');

const router = express();

router.use(express.json());

router.get('/', async (req, res) => {
  res.send(await Genre.find().sort('genre'));
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = new Genre({ genre: req.body.genre });
  genre = await genre.save();
  res.send(genre);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(req.params.id, { genre: req.body.genre }, {
    new: true,
  });

  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
});

router.delete('/:id', async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
});

router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
});

module.exports = router;
