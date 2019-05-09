const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rentalModel');
const { User } = require('../../models/userModel');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;

  const exec = async () => request(server)
    .post('/api/returns/')
    .set('x-auth-token', token)
    .send({ customerId, movieId });

  beforeEach(async () => {
    server = require('../../../index');
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    rental = new Rental({
      customer: {
        id: customerId,
        name: '12345',
        phone: '12345',
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2,
      },
    });

    await rental.save();
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Rental.remove({});
  });

  it('Should return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('Should return 400 if customerId is not provided', async () => {
    customerId = '';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('Should return 400 if movieId is not provided', async () => {
    movieId = '';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('Should return 404 if no rental found for this customer/movie', async () => {
    await Rental.remove({});
    const res = await exec();

    expect(res.status).toBe(404);
  });
});