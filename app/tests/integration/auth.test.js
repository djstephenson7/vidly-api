const request = require('supertest');
const { User } = require('../../models/userModel');
const { Genre } = require('../../models/genreModel');

describe('Auth middleware', () => {
  let token;

  beforeEach(() => {
    token = new User().generateAuthToken();
    server = require('../../../index');
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  const exec = () => request(server)
    .post('/api/genres')
    .set('x-auth-token', token)
    .send({ genre: 'Genre1' });

  it('Should return 401 if no auth token is provided', async () => {
    token = '';
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('Should return 400 if token is invalid', async () => {
    token = 'a';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('Should return 200 if token is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
