const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const { Rental } = require('../../models/rentalModel');
const { Movie } = require('../../models/movieModel');
const { User } = require('../../models/userModel');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const exec = async () => request(server)
    .post('/api/returns/')
    .set('x-auth-token', token)
    .send({ customerId, movieId });

  beforeEach(async () => {
    server = require('../../../index');
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    movie = new Movie({
      _id: movieId,
      title: '12345',
      dailyRentalRate: 2,
      genre: { genre: '12345' },
      numberInStock: 10,
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
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
    await Movie.remove({});
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

  it('Should return 400 if return is already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('Should return 404 if no rental found for this customer/movie', async () => {
    await Rental.remove({});
    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('Should return 200 if valid request', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it('Should set returnDate if input is valid', async () => {
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('Should set rentalFee is input is valid', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('Should increase the movieStock is input is valid', async () => {
    const res = await exec();
    const movieInDb = await Movie.findById(movieId);

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('Should feturn the rental if input is valid', async () => {
    const res = await exec();
    const rentalInDb = Rental.findById(rental._id);

    expect(Object.keys(res.body))
      .toEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee',
        'customer', 'movie']));
  });
});
