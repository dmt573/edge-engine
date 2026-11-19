'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const STORE_PATH = path.join(__dirname, '..', 'data', 'forecasts.json');

async function readForecasts() {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeForecasts(forecasts) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const temporaryPath = `${STORE_PATH}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(forecasts, null, 2) + '\n', 'utf8');
  await fs.rename(temporaryPath, STORE_PATH);
}

async function addForecast(input) {
  const forecasts = await readForecasts();
  const item = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    market_ticker: input.market_ticker.trim(),
    market_title: input.market_title.trim(),
    market_probability_at_entry: input.market_probability_at_entry,
    forecast_probability: input.forecast_probability,
    thesis: input.thesis.trim(),
    source_urls: input.source_urls,
    resolved_outcome: null,
    resolved_at: null
  };
  forecasts.unshift(item);
  await writeForecasts(forecasts);
  return item;
}

async function resolveForecast(id, outcome) {
  const forecasts = await readForecasts();
  const index = forecasts.findIndex((item) => item.id === id);
  if (index < 0) return null;
  forecasts[index] = { ...forecasts[index], resolved_outcome: outcome, resolved_at: new Date().toISOString() };
  await writeForecasts(forecasts);
  return forecasts[index];
}

module.exports = { readForecasts, addForecast, resolveForecast };
