const express = require('express');
const Joi = require('joi');

const app = express();

app.use(express.json());

const genres = [
  { id: 1, genre: 'Action' },
  { id: 2, genre: 'Comedy' },
  { id: 3, genre: 'Horror' },
];

function validateGenre(genre) {
  const schema = {
    genre: Joi.string().min(3).required(),
  };
  return Joi.validate(genre, schema);
}

app.get('/', (req, res) => res.send('Welcome to the genres'));

app.get('/vidly.com/api/genres', (req, res) => {
  res.send(genres);
});

app.post('/vidly.com/api/genres/:id', (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = {
    id: genres.length + 1,
    genre: req.body.genre,
  };
  genres.push(genre);
  res.send(genre);
});

app.put('/vidly.com/api/genres/:id', (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('No such genre');

  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genre.genre = req.body.genre;
  res.send(genre);
});

app.delete('/vidly.com/api/genres/:id', (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('No such genre');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  res.send(genre);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
