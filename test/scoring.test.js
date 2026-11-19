'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { tokens, matchEvidence, brierScore } = require('../src/scoring');

test('tokenizer removes common words and punctuation', () => {
  assert.deepEqual([...tokens('The Federal Register proposes stablecoin reserve rules!')].sort(), ['proposes', 'reserve', 'stablecoin']);
});

test('evidence matcher requires at least two overlapping terms', () => {
  const markets = [{ ticker: 'M1', title: 'Stablecoin reserve requirements', subtitle: '', category: '', implied_probability: 0.5, volume: 10, url: '' }];
  const docs = [{ document_number: 'D1', title: 'Stablecoin reserve requirements proposed', abstract: '', publication_date: '2026-11-18', agencies: [], html_url: '' }];
  const matches = matchEvidence(markets, docs);
  assert.equal(matches.length, 1);
  assert.ok(matches[0].matched_terms.includes('stablecoin'));
});

test('Brier score is mean squared probability error', () => {
  const score = brierScore([{ forecast_probability: 0.8, resolved_outcome: 1 }, { forecast_probability: 0.3, resolved_outcome: 0 }]);
  assert.equal(score, 0.065);
});

test('Brier score is null before any forecasts resolve', () => {
  assert.equal(brierScore([{ forecast_probability: 0.8, resolved_outcome: null }]), null);
});

test('market baseline score excludes forecasts without an entry probability', () => {
  const rows = [
    { forecast_probability: 0.8, market_probability_at_entry: 0.6, resolved_outcome: 1 },
    { forecast_probability: 0.3, market_probability_at_entry: null, resolved_outcome: 0 }
  ];
  assert.equal(brierScore(rows, 'market_probability_at_entry'), 0.16);
});
