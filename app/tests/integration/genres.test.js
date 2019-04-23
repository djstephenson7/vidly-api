const request = require('supertest');
const { Genre } = require('../../models/genreModel');

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
});
