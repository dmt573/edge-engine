'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const DEFAULT_LEDGER_FILE = path.join(process.cwd(), 'data', 'learning-ledger.jsonl');
const STATUSES = new Set(['discovered', 'evaluating', 'watching', 'paper', 'acted', 'rejected', 'closed']);
const CASHFLOW_TYPES = new Set(['receipt', 'reward', 'expense', 'refund', 'transfer', 'capital', 'loan', 'withdrawal', 'other']);
const UPDATE_FIELDS = new Set(['status', 'notes', 'thesis', 'invalidation', 'horizon', 'catalyst']);

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`);
  return value.trim();
}

function makeEvent(type, payload) {
  return { eventId: randomUUID(), type, occurredAt: new Date().toISOString(), payload };
}

async function readEvents(filePath = DEFAULT_LEDGER_FILE) {
  let body;
  try {
    body = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return body.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid learning-ledger JSON on line ${index + 1}.`); }
  });
}

async function appendEvent(event, filePath = DEFAULT_LEDGER_FILE) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(event) + '\n', 'utf8');
  return event;
}

function projectEvents(events) {
  const opportunities = new Map();
  const forecasts = new Map();
  const cashflows = [];

  for (const event of events) {
    const p = event.payload || {};
    if (event.type === 'opportunity.created') {
      opportunities.set(p.id, { ...p, createdAt: event.occurredAt, updatedAt: event.occurredAt });
    } else if (event.type === 'opportunity.updated' && opportunities.has(p.id)) {
      const current = opportunities.get(p.id);
      opportunities.set(p.id, { ...current, ...p.changes, updatedAt: event.occurredAt });
    } else if (event.type === 'forecast.logged') {
      forecasts.set(p.id, { ...p, createdAt: event.occurredAt, resolvedAt: null, outcome: null });
    } else if (event.type === 'forecast.resolved' && forecasts.has(p.id)) {
      const current = forecasts.get(p.id);
      forecasts.set(p.id, { ...current, outcome: p.outcome, resolvedAt: event.occurredAt });
    } else if (event.type === 'cashflow.recorded') {
      cashflows.push({ ...p, recordedAt: event.occurredAt });
    }
  }

  return {
    opportunities: [...opportunities.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    forecasts: [...forecasts.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    cashflows,
  };
}

async function addOpportunity(input, filePath = DEFAULT_LEDGER_FILE) {
  const id = `opp-${randomUUID().slice(0, 8)}`;
  const payload = {
    id,
    title: requiredText(input.title, 'Opportunity title'),
    thesis: requiredText(input.thesis, 'Thesis'),
    domain: requiredText(input.domain, 'Domain').toLowerCase(),
    market: input.market || null,
    catalyst: input.catalyst || null,
    horizon: input.horizon || null,
    invalidation: input.invalidation || null,
    evidenceIds: Array.isArray(input.evidenceIds) ? input.evidenceIds : [],
    status: 'discovered',
  };
  await appendEvent(makeEvent('opportunity.created', payload), filePath);
  return payload;
}

async function updateOpportunity(id, changes, filePath = DEFAULT_LEDGER_FILE) {
  requiredText(id, 'Opportunity ID');
  const state = projectEvents(await readEvents(filePath));
  if (!state.opportunities.some((item) => item.id === id)) throw new Error(`Opportunity not found: ${id}`);
  const clean = {};
  for (const [key, value] of Object.entries(changes)) {
    if (!UPDATE_FIELDS.has(key) || value === undefined || value === null || value === '') continue;
    if (key === 'status' && !STATUSES.has(value)) throw new Error(`Status must be one of: ${[...STATUSES].join(', ')}.`);
    clean[key] = value;
  }
  if (!Object.keys(clean).length) throw new Error('Provide at least one supported field to update.');
  await appendEvent(makeEvent('opportunity.updated', { id, changes: clean }), filePath);
  return projectEvents(await readEvents(filePath)).opportunities.find((item) => item.id === id);
}

async function logForecast(input, filePath = DEFAULT_LEDGER_FILE) {
  const state = projectEvents(await readEvents(filePath));
  const opportunityId = requiredText(input.opportunityId, 'Opportunity ID');
  if (!state.opportunities.some((item) => item.id === opportunityId)) throw new Error(`Opportunity not found: ${opportunityId}`);
  const probability = Number(input.probability);
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new Error('Probability must be between 0 and 1.');
  let benchmark = null;
  if (input.benchmark !== undefined && input.benchmark !== null && input.benchmark !== '') {
    benchmark = Number(input.benchmark);
    if (!Number.isFinite(benchmark) || benchmark < 0 || benchmark > 1) throw new Error('Benchmark probability must be between 0 and 1.');
  }
  const payload = {
    id: `fcst-${randomUUID().slice(0, 8)}`,
    opportunityId,
    question: requiredText(input.question, 'Forecast question'),
    probability,
    horizon: requiredText(input.horizon, 'Forecast horizon'),
    benchmark,
    sourceCutoff: input.sourceCutoff || new Date().toISOString(),
  };
  await appendEvent(makeEvent('forecast.logged', payload), filePath);
  return payload;
}

async function resolveForecast(id, outcome, filePath = DEFAULT_LEDGER_FILE) {
  requiredText(id, 'Forecast ID');
  if (!['yes', 'no'].includes(outcome)) throw new Error('Outcome must be yes or no.');
  const state = projectEvents(await readEvents(filePath));
  const forecast = state.forecasts.find((item) => item.id === id);
  if (!forecast) throw new Error(`Forecast not found: ${id}`);
  if (forecast.resolvedAt) throw new Error('Forecast is already resolved; corrections should be recorded as a new forecast.');
  await appendEvent(makeEvent('forecast.resolved', { id, outcome }), filePath);
  return projectEvents(await readEvents(filePath)).forecasts.find((item) => item.id === id);
}

async function recordCashflow(input, filePath = DEFAULT_LEDGER_FILE) {
  const type = requiredText(input.type, 'Cashflow type').toLowerCase();
  if (!CASHFLOW_TYPES.has(type)) throw new Error(`Cashflow type must be one of: ${[...CASHFLOW_TYPES].join(', ')}.`);
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number.');
  const currency = String(input.currency || 'USD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency must be a three-letter code such as USD.');
  const state = projectEvents(await readEvents(filePath));
  const opportunityId = input.opportunityId || null;
  if (opportunityId && !state.opportunities.some((item) => item.id === opportunityId)) {
    throw new Error(`Opportunity not found: ${opportunityId}`);
  }
  const payload = {
    id: `cash-${randomUUID().slice(0, 8)}`,
    type,
    amount: Math.round(amount * 100) / 100,
    currency,
    description: requiredText(input.description, 'Description'),
    opportunityId,
    transactionDate: input.date || new Date().toISOString().slice(0, 10),
  };
  await appendEvent(makeEvent('cashflow.recorded', payload), filePath);
  return payload;
}

function buildReport(events) {
  const state = projectEvents(events);
  const resolved = state.forecasts.filter((item) => item.resolvedAt);
  const brierScore = resolved.length
    ? resolved.reduce((sum, item) => sum + (item.probability - (item.outcome === 'yes' ? 1 : 0)) ** 2, 0) / resolved.length
    : null;
  const benchmarkResolved = resolved.filter((item) => Number.isFinite(item.benchmark));
  const benchmarkBrierScore = benchmarkResolved.length
    ? benchmarkResolved.reduce((sum, item) => sum + (item.benchmark - (item.outcome === 'yes' ? 1 : 0)) ** 2, 0) / benchmarkResolved.length
    : null;
  const finances = {};
  for (const item of state.cashflows) {
    const bucket = finances[item.currency] ||= { earned: 0, refunds: 0, expenses: 0, excludedFlows: 0, entries: 0 };
    bucket.entries += 1;
    if (item.type === 'receipt' || item.type === 'reward') bucket.earned += item.amount;
    else if (item.type === 'refund') bucket.refunds += item.amount;
    else if (item.type === 'expense') bucket.expenses += item.amount;
    else bucket.excludedFlows += item.amount;
  }
  for (const bucket of Object.values(finances)) {
    bucket.netOperatingCash = Math.round((bucket.earned + bucket.refunds - bucket.expenses) * 100) / 100;
    for (const key of ['earned', 'refunds', 'expenses', 'excludedFlows']) bucket[key] = Math.round(bucket[key] * 100) / 100;
  }
  const byStatus = {};
  for (const item of state.opportunities) byStatus[item.status] = (byStatus[item.status] || 0) + 1;
  return {
    eventCount: events.length,
    opportunities: { total: state.opportunities.length, byStatus, items: state.opportunities },
    forecasts: {
      total: state.forecasts.length,
      unresolved: state.forecasts.length - resolved.length,
      resolved: resolved.length,
      brierScore: brierScore === null ? null : Math.round(brierScore * 10000) / 10000,
      benchmarkBrierScore: benchmarkBrierScore === null ? null : Math.round(benchmarkBrierScore * 10000) / 10000,
      benchmarkSampleSize: benchmarkResolved.length,
      items: state.forecasts,
      note: 'Brier score is meaningful only for clearly defined, timestamped binary forecasts with consistently recorded outcomes. Lower is better; compare the same resolved sample against its base-rate benchmark.',
    },
    finances: {
      byCurrency: finances,
      note: 'Receipts and rewards count as earned inflows; refunds offset expenses. Transfers, capital deposits, loans, withdrawals, and other entries are excluded from net operating cash.',
    },
  };
}

module.exports = {
  DEFAULT_LEDGER_FILE,
  addOpportunity,
  updateOpportunity,
  logForecast,
  resolveForecast,
  recordCashflow,
  readEvents,
  projectEvents,
  buildReport,
};
