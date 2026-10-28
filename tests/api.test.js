const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('GET /api/employees returns array', async () => {
  const res = await request(app).get('/api/employees');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('POST /api/auth/login succeeds with demo credentials', async () => {
  const payload = { email: 'admin@company.com', password: 'password123' };
  const res = await request(app).post('/api/auth/login').send(payload);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, 'admin@company.com');
});
