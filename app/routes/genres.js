const express = require('express');
const { Genre, validateGenre } = require('../models/genreModel');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const router = express();

router.use(express.json());

router.get('/', async (req, res) => {
  res.send(await Genre.find().sort('genre'));
});

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
});

router.post('/', [auth, validate(validateGenre)], async (req, res) => {
  let genre = new Genre({ genre: req.body.genre });
  genre = await genre.save();
  res.send(genre);
});

router.put('/:id', [auth, validateObjectId, validate(validateGenre)], async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(req.params.id, { genre: req.body.genre }, {
    new: true,
  });

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('No such genre');
  res.send(genre);
});


module.exports = router;
