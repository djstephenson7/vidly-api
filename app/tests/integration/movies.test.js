const request = require('supertest');
const mongoose = require('mongoose');
const { Movie } = require('../../models/movieModel');
const { User } = require('../../models/userModel');
const { Genre } = require('../../models/genreModel');

let server;

describe('/api/movies/', () => {
  beforeEach(() => { server = require('../../../index'); });

  afterEach(async () => {
    await server.close();
    await Movie.remove({});
    await Genre.remove({});
  });

  describe('GET /', () => {
    it('Should return all movies', async () => {
      await Movie.collection.insertMany([
        {
          title: 'Movie1', genre: 'Genre1', numberInStock: 1, dailyRentalRate: 1,
        },
        {
          title: 'Movie2', genre: 'Genre2', numberInStock: 1, dailyRentalRate: 1,
        },
        {
          title: 'Movie3', genre: 'Genre3', numberInStock: 1, dailyRentalRate: 1,
        },
      ]);
      const res = await request(server).get('/api/movies');
      expect(res.status).toBe(200);
      expect(res.body.some(m => m.title === 'Movie1')).toBeTruthy();
      expect(res.body.some(m => m.title === 'Movie2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('Should return a movie if a valid ID is passed', async () => {
      const genre = new Genre({ genre: 'Genre1' });
      const movie = new Movie({
        title: 'Movie1', genre, numberInStock: 1, dailyRentalRate: 1,
      });
      await genre.save();
      await movie.save();
      const res = await request(server).get(`/api/movies/${movie._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', movie.title);
    });

    it('Should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/movies/1');

      expect(res.status).toBe(404);
    });

    it('Should return 404 if no movie with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/movies/${id}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let genre;
    let movie;
    let title;

    beforeEach(async () => {
      title = '12345';
      token = new User().generateAuthToken();
      genre = new Genre({ genre: 'Genre1' });
      movie = new Movie({
        title, genre, numberInStock: 1, dailyRentalRate: 1,
      });

      await genre.save();
      await movie.save();
      await genreExec();
    });

    const genreExec = async () => await request(server)
      .post('/api/genres/')
      .set('x-auth-token', token)
      .send({ genre });

    const movieExec = async () => await request(server)
      .post('/api/movies/')
      .set('x-auth-token', token)
      .send({ movie });

    it('Should return 401 if client is not logged in', async () => {
      token = '';
      const res = await movieExec();

      expect(res.status).toBe(401);
    });

    it('Should return 400 if movie is less than 5 characters', async () => {
      title = '1234';
      const res = await movieExec();

      expect(res.status).toBe(400);
    });

    it('Should return 400 if movie is more than 50 characters', async () => {
      movie.title = new Array(52).join('a');
      const res = await movieExec();

      expect(res.status).toBe(400);
    });

    it('Should save the movie if valid', async () => {
      const res = await movieExec();
      const movie = await Movie.find({ title: 'Movie1' });

      expect(movie).not.toBeNull();
    });

    xit('Should return the movie if valid', async () => {
      const res = await movieExec();
      const movie = await Movie.find({ title: 'Movie1' });

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'Movie1');
    });
  });

  describe('PUT/:id', () => {
    let movie;
    let updatedTitle;
    let id;
    let token;
    let genre;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      genre = new Genre({ genre: 'Genre1' });
      movie = new Movie({
        title: 'Movie1', genre, numberInStock: 1, dailyRentalRate: 1,
      });
      await movie.save();
      await genre.save();
      id = movie._id;
      updatedTitle = 'updatedTitle';
    });

    const exec = async () => await request(server)
      .put(`/api/movies/${id}`)
      .set('x-auth-token', token)
      .send({ title: updatedTitle });

    xit('Should update movie params successfully if ID is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty(genre);
    });

    xit('Should return the updated movie if params are valid', async () => {
      await exec();
      const updatedMovie = await Movie.findById(movie._id);

      expect(updatedMovie.title).toBe(updatedTitle);
    });

    it('Should return 400 if movie title is less than 5 characters', async () => {
      updatedTitle = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('Should return 400 if movie title is more than 255 characters', async () => {
      updatedTitle = new Array(257).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('Should return 404 if movie with valid ID does not exist', async () => {
      id = mongoose.Types.ObjectId;
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let genre;
    let movie;
    let id;

    const exec = async () => await request(server)
      .delete(`/api/movies/${id}`)
      .set('x-auth-token', token)
      .send();

    beforeEach(async () => {
      genre = new Genre({ genre: 'Genre1' });
      movie = new Movie({
        title: '12345', genre, numberInStock: 1, dailyRentalRate: 1,
      });

      await movie.save();
      await genre.save();

      id = movie._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it('Should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('Should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('Should return 404 if id is invalid', async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('Should return 404 if no genre with the given id was found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('Should delete the genre if input is valid', async () => {
      await exec();
      const genreInDb = await Movie.findById(id);

      expect(genreInDb).toBeNull();
    });

    it('Should return the removed genre', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', movie._id.toHexString());
      expect(res.body).toHaveProperty('title', movie.title);
    });
  });
});
