'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMarketsUrl, centsOrDollars } = require('../src/sources/kalshi');

test('Kalshi markets URL preserves the documented API path', () => {
  const url = buildMarketsUrl(50);
  assert.equal(url.origin, 'https://external-api.kalshi.com');
  assert.equal(url.pathname, '/trade-api/v2/markets');
  assert.equal(url.searchParams.get('limit'), '50');
  assert.equal(url.searchParams.get('status'), 'open');
});

test('Kalshi price normalization handles cents and decimal dollars', () => {
  assert.equal(centsOrDollars(undefined, 57), 0.57);
  assert.equal(centsOrDollars('0.63', 63), 0.63);
  assert.equal(centsOrDollars(undefined, undefined), null);
});
