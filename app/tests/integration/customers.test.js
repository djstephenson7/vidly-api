// PUT /:id happy path
// 9. PUT /:id return 400 if (see 5-8)
// 10. PUT /:id return 404 if customer with the given ID not found.
// DELETE /:id happy path
// 11. DELETE /:id return 404 if customer with the given ID not found.
// 12. DELETE /:id Deletes customer successfully if ID valid
const request = require('supertest');
const mongoose = require('mongoose');
const { Customer, validate } = require('../../models/customerModel');
const { User } = require('../../models/userModel');
const token = require('../../middleware/auth');

let server;

describe('/api/customers', () => {
  beforeEach(() => { server = require('../../../index'); });

  afterEach(async () => {
    await server.close();
    await Customer.remove({});
  });

  describe('GET /', () => {
    it('Should return all customers', async () => {
      await Customer.collection.insertMany([
        { name: 'Customer1', phone: '12345' },
        { name: 'Customer2', phone: '12345' },
        { name: 'Customer3', phone: '12345' },
      ]);
      const res = await request(server).get('/api/customers');
      expect(res.status).toBe(200);
      expect(res.body.some(g => g.name === 'Customer1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'Customer2')).toBeTruthy();
    });
  });

  describe('GET/:id', () => {
    it('Should return a customer if the ID is valid', async () => {
      const customer = new Customer({ name: 'Customer1', phone: '12345' });
      await customer.save();
      const res = await request(server).get(`/api/customers/${customer._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', customer.name);
      expect(res.body).toHaveProperty('phone', customer.phone);
    });

    it('Should return 404 if customer id is invalid', async () => {
      const res = await request(server).get('/api/customers/1');

      expect(res.status).toBe(404);
    });

    it('Should return 404 if no genre with the given ID exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/customers/${id}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST/', () => {
    let name;
    let phone;
    let token;

    beforeEach(async () => {
      name = 'Customer1';
      phone = '12345';
      token = new User().generateAuthToken();
    });

    const exec = async () => await request(server)
      .post('/api/customers/')
      .set('x-auth-token', token)
      .send({ name, phone });

    it('Should save a new customer if params are valid', async () => {
      const res = await exec();
      const customer = await Customer.find({ name: 'Customer1' });

      expect(customer).not.toBeNull();
      expect(res.status).toBe(200);
    });

    it('Should return the customer if valid', async () => {
      const res = await exec();
      const customer = await Customer.find({ name: 'Customer1' });

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Customer1');
      expect(res.body).toHaveProperty('phone', '12345');
      expect(res.status).toBe(200);
    });

    it('Should return 401 if client not logged in', async () => {
      token = '';
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('Should return 400 if customer name is less than 5 characters', async () => {
      name = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('Should return 400 if customer phone is less than 5 characters', async () => {
      phone = '1234';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('Should return 400 if customer name is more than 255 characters', async () => {
      name = new Array(257).join('a');
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('Should return 400 if customer phone is more than 50 characters', async () => {
      phone = new Array(52).join('0');
      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
