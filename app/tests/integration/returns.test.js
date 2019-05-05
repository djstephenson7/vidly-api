const request = require('supertest');
const { Rental } = require('../../models/rentalModel');
const mongoose = require('mongoose');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;

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
  });

  afterEach(async () => {
    await server.close();
    await Rental.remove({});
  });

  it('Should return 401 if client is not logged in', async () => {
    const res = await request(server)
      .post('/api/returns')
      .send({ customerId, movieId });

    expect(res.status).toBe(401);
  });
});
