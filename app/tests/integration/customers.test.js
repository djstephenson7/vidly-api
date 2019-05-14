// POST happy path
// 5. POST return 401 if customer less than 5 characters
// 6. POST return 401 if customer more than 255 characters
// 7. POST return 401 if phone less than 5 characters
// 8. POST return 401 if phone more than 50 characters
// PUT /:id happy path
// 9. PUT /:id return 400 if (see 5-8)
// 10. PUT /:id return 404 if customer with the given ID not found.
// DELETE /:id happy path
// 11. DELETE /:id return 404 if customer with the given ID not found.
// 12. DELETE /:id Deletes customer successfully if ID valid
const request = require('supertest');
const mongoose = require('mongoose');
const { Customer, validate } = require('../../models/customerModel');

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
});
