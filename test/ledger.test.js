'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  addOpportunity, updateOpportunity, logForecast, resolveForecast,
  recordCashflow, readEvents, buildReport,
} = require('../src/learning/ledger');

async function temporaryLedger(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'edge-ledger-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return path.join(dir, 'learning-ledger.jsonl');
}

test('opportunities are created and updates preserve an append-only history', async (t) => {
  const file = await temporaryLedger(t);
  const opportunity = await addOpportunity({ title: 'Example catalyst', thesis: 'A testable thesis', domain: 'crypto' }, file);
  const updated = await updateOpportunity(opportunity.id, { status: 'paper', notes: 'Observe only' }, file);
  assert.equal(updated.status, 'paper');
  assert.equal(updated.notes, 'Observe only');
  assert.equal((await readEvents(file)).length, 2);
});

test('forecasts require a real opportunity and valid probability, then resolve once', async (t) => {
  const file = await temporaryLedger(t);
  const opportunity = await addOpportunity({ title: 'Test', thesis: 'Test thesis', domain: 'stocks' }, file);
  await assert.rejects(logForecast({ opportunityId: opportunity.id, question: 'Will it happen?', probability: 1.2, horizon: '1 day' }, file), /between 0 and 1/);
  const forecast = await logForecast({ opportunityId: opportunity.id, question: 'Will it happen?', probability: 0.7, horizon: '1 day', benchmark: 0.4 }, file);
  await resolveForecast(forecast.id, 'yes', file);
  await assert.rejects(resolveForecast(forecast.id, 'no', file), /already resolved/);
  const report = buildReport(await readEvents(file));
  assert.equal(report.forecasts.resolved, 1);
  assert.equal(report.forecasts.brierScore, 0.09);
  assert.equal(report.forecasts.benchmarkBrierScore, 0.36);
});

test('cashflow separates earned income and expenses from transfers and capital', async (t) => {
  const file = await temporaryLedger(t);
  await recordCashflow({ type: 'receipt', amount: 100, description: 'Payment received' }, file);
  await recordCashflow({ type: 'expense', amount: 15.5, description: 'Operating cost' }, file);
  await recordCashflow({ type: 'capital', amount: 500, description: 'Capital deposit' }, file);
  const report = buildReport(await readEvents(file));
  assert.equal(report.finances.byCurrency.USD.earned, 100);
  assert.equal(report.finances.byCurrency.USD.expenses, 15.5);
  assert.equal(report.finances.byCurrency.USD.excludedFlows, 500);
  assert.equal(report.finances.byCurrency.USD.netOperatingCash, 84.5);
});

test('cashflow requires a positive amount and valid classification', async (t) => {
  const file = await temporaryLedger(t);
  await assert.rejects(recordCashflow({ type: 'receipt', amount: -1, description: 'Bad' }, file), /positive number/);
  await assert.rejects(recordCashflow({ type: 'mystery', amount: 10, description: 'Bad' }, file), /Cashflow type must be one of/);
});

test('forecast benchmark probability must also be in range', async (t) => {
  const file = await temporaryLedger(t);
  const opportunity = await addOpportunity({ title: 'Test', thesis: 'Test thesis', domain: 'crypto' }, file);
  await assert.rejects(logForecast({ opportunityId: opportunity.id, question: 'Will it happen?', probability: 0.5, horizon: '1 day', benchmark: 1.1 }, file), /Benchmark probability must be between 0 and 1/);
});
