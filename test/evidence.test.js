'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createEvidence } = require('../src/core/evidence');
const { scoreDexPair, summarizeEvidence } = require('../src/analysis/triage');

test('evidence records require provenance fields', () => {
  assert.throws(() => createEvidence({ title: 'Missing provenance' }), /missing required field/);
});

test('evidence records have stable source identifiers and preserve limitations', () => {
  const record = createEvidence({
    source: 'test', sourceId: 'abc', recordType: 'test_record',
    title: 'Example', url: 'https://example.com', observedAt: '2026-11-01T00:00:00.000Z',
    limitations: ['not verified'],
  });
  assert.equal(record.id, 'test:abc');
  assert.deepEqual(record.limitations, ['not verified']);
});

test('DEX triage returns a heuristic label and explicit risk flags', () => {
  const result = scoreDexPair({
    id: 'dexscreener:solana:pair', publishedAt: new Date().toISOString(),
    assetAddress: 'token', data: { pairAddress: 'pair', liquidityUsd: 1000, volume24hUsd: 50000, txns24h: { buys: 10, sells: 5 } },
  });
  assert.ok(result.researchPriorityScore >= 0 && result.researchPriorityScore <= 100);
  assert.ok(result.riskFlags.includes('low_reported_liquidity'));
  assert.match(result.interpretation, /not a probability/);
});

test('evidence summary groups records by source', () => {
  const summary = summarizeEvidence([{ source: 'a' }, { source: 'a' }, { source: 'b' }]);
  assert.equal(summary.totalRecords, 3);
  assert.deepEqual(summary.bySource, { a: 2, b: 1 });
});
