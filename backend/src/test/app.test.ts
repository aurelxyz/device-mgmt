import request from 'supertest';
import app from '../app.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert';

const apiKey = process.env.API_KEYS?.split(',')?.[0];
if (!apiKey) {
  throw new Error('Environment variable API_KEYS is missing');
}

describe('GET /devices', () => {
  it('responds with an array of devices', async () => {
    const res = await request(app)
      .get('/devices')
      .set({ 'X-API-KEY': apiKey })
      .expect('Content-Type', /json/)
      .expect(200);

    assert.ok(Array.isArray(res.body));
  });
});

describe('POST /devices', () => {
  it('creates a new device', async () => {
    const newDevice = {
      mac: mockMac(),
      modelId: 6,
      status: 'stock'
    };

    const res = await request(app)
      .post('/devices')
      .set({ 'X-API-KEY': apiKey })
      .send(newDevice)
      .expect('Content-Type', /json/)
      .expect(200);

    assert.ok(Number.isInteger(res.body.id) || res.body.id > 0);
  });

  it('fails if mac is missing', async () => {
    const newDevice = {
      modelId: 6,
      status: 'stock'
    };

    const res = await request(app)
      .post('/devices')
      .set({ 'X-API-KEY': apiKey })
      .send(newDevice)
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

//-------------------------------------------------------------------------

const mockMac = () => {
  const mock = new Date().valueOf().toString();   // example: 1753711087394
  return mock.substring(1, 3) + ':' + 
      mock.substring(3, 5) + ':' + 
      mock.substring(5, 7) + ':' + 
      mock.substring(7, 9) + ':' + 
      mock.substring(9, 11) + ':' + 
      mock.substring(11, 13);                     //        => 75:37:11:08:73:94
}