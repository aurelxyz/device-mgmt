import request from 'supertest';
import app from '../app.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('GET /devices', () => {
  it('responds with an array of devices', async () => {
    const response = await request(app)
      .get('/devices')
      .expect('Content-Type', /json/)
      .expect(200);

    assert(Array.isArray(response.body));
  });
});

// describe('POST /devices', () => {
//   it('creates a new device', async () => {
//     const newDevice = {
//       mac: '12:34:56',
//       ...
//     };

//     const response = await request(app)
//       .post('/devices')
//       .send(newDevice)
//       .expect('Content-Type', /json/)
//       .expect(201);

//     expect(response.body).toMatchObject(newDevice);
//   });
// });
