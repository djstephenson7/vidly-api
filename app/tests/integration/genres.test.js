const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../models/genreModel');
const { User } = require('../../models/userModel');

let server;

describe('/api/genres', () => {
  beforeEach(() => { server = require('../../../index'); });

  afterEach(async () => {
    server.close();
    await Genre.remove({});
  });

  describe('GET /', () => {
    it('Should return all genres', async () => {
      await Genre.collection.insertMany([
        { genre: 'Genre1' },
        { genre: 'Genre2' },
        { genre: 'Genre3' },
      ]);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.some(g => g.genre === 'Genre1')).toBeTruthy();
      expect(res.body.some(g => g.genre === 'Genre2')).toBeTruthy();
    });
  });
});

describe('GET/:id', () => {
  it('Should return a genre if a valid ID is passed', async () => {
    const genre = new Genre({ genre: 'Genre1' });
    await genre.save();
    const res = await request(server).get(`/api/genres/${genre._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('genre', genre.genre);
  });

  it('Should return 404 if invalid id is passed', async () => {
    const res = await request(server).get('/api/genres/1');

    expect(res.status).toBe(404);
  });

  it('Should return 404 if no genre with the given id exists', async () => {
    const id = mongoose.Types.ObjectId();
    const res = await request(server).get(`/api/genres/${id}`);

    expect(res.status).toBe(404);
  });
});

describe('POST/', () => {
  let token;
  let genre;

  beforeEach(() => {
    token = new User().generateAuthToken();
    genre = 'Genre1';
  });

  const exec = async () => await request(server)
    .post('/api/genres/')
    .set('x-auth-token', token)
    .send({ genre });

  it('Should return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('Should return 400 if genre is less than 5 characters', async () => {
    genre = '1234';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('Should return 400 if genre is more than 50 characters', async () => {
    genre = new Array(52).join('a');
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('Should save the genre if valid', async () => {
    await exec();
    const genre = await Genre.find({ genre: 'Genre1' });

    expect(genre).not.toBeNull();
  });

  it('Should return the genre if valid', async () => {
    const res = await exec();
    const genre = await Genre.find({ genre: 'Genre1' });

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('genre', 'Genre1');
  });
});

describe('PUT /:id', () => {
  let token;
  let newName;
  let genre;
  let id;

  const exec = async () => await request(server)
    .put(`/api/genres/${id}`)
    .set('x-auth-token', token)
    .send({ genre: newName });

  beforeEach(async () => {
    // Before each test we need to create a genre and
    // put it in the database.
    genre = new Genre({ genre: 'genre1' });
    await genre.save();

    token = new User().generateAuthToken();
    id = genre._id;
    newName = 'updatedName';
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if genre is less than 5 characters', async () => {
    newName = '1234';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genre is more than 50 characters', async () => {
    newName = new Array(52).join('a');
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if id is invalid', async () => {
    id = 1;
    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 404 if genre with the given id was not found', async () => {
    id = mongoose.Types.ObjectId();
    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should update the genre if input is valid', async () => {
    await exec();
    const updatedGenre = await Genre.findById(genre._id);

    expect(updatedGenre.genre).toBe(newName);
  });

  it('should return the updated genre if it is valid', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('genre', newName);
  });
});
