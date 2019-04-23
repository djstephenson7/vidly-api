const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../models/genreModel');
const { User } = require('../../models/userModel');

let server;

describe('/api/genres', () => {
  beforeEach(() => { server = require('../../../index'); });

  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  describe('GET /', () => {
    it('Should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'Genre1' },
        { name: 'Genre2' },
        { name: 'Genre3' },
      ]);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.some(g => g.name === 'Genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'Genre2')).toBeTruthy();
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
