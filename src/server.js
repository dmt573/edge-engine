'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { fetchOpenMarkets } = require('./sources/kalshi');
const { fetchRecentDocuments } = require('./sources/federal-register');
const { matchEvidence, brierScore } = require('./scoring');
const { readForecasts, addForecast, resolveForecast } = require('./store');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': MIME['.json'], 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new Error('Request body is too large');
  }
  return body ? JSON.parse(body) : {};
}

function validProbability(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(response, 200, { status: 'ok', mode: 'read-only-paper-research', trading_enabled: false, checked_at: new Date().toISOString() });
  }

  if (request.method === 'GET' && url.pathname === '/api/scan') {
    const [marketResult, documentResult] = await Promise.allSettled([fetchOpenMarkets(100), fetchRecentDocuments(50)]);
    const markets = marketResult.status === 'fulfilled' ? marketResult.value : [];
    const documents = documentResult.status === 'fulfilled' ? documentResult.value : [];
    const errors = [];
    if (marketResult.status === 'rejected') errors.push({ source: 'Kalshi', message: marketResult.reason.message });
    if (documentResult.status === 'rejected') errors.push({ source: 'Federal Register', message: documentResult.reason.message });
    const matches = matchEvidence(markets, documents);
    return sendJson(response, errors.length === 2 ? 502 : 200, {
      fetched_at: new Date().toISOString(),
      markets_count: markets.length,
      documents_count: documents.length,
      matches_count: matches.length,
      markets,
      documents,
      matches,
      errors,
      interpretation: 'Matches are keyword overlaps between public records and market titles. They are research leads, not evidence of causation or trading signals.'
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/forecasts') {
    const forecasts = await readForecasts();
    return sendJson(response, 200, { forecasts, brier_score: brierScore(forecasts), resolved_count: forecasts.filter((f) => f.resolved_outcome === 0 || f.resolved_outcome === 1).length });
  }

  if (request.method === 'POST' && url.pathname === '/api/forecasts') {
    const body = await readBody(request);
    if (!body.market_ticker || !body.market_title || !body.thesis ||
        !validProbability(body.forecast_probability) ||
        !(body.market_probability_at_entry === null || validProbability(body.market_probability_at_entry))) {
      return sendJson(response, 400, { error: 'Provide market_ticker, market_title, thesis, forecast_probability (0–1), and market_probability_at_entry (0–1 or null).' });
    }
    const item = await addForecast({
      market_ticker: String(body.market_ticker).slice(0, 120),
      market_title: String(body.market_title).slice(0, 500),
      market_probability_at_entry: body.market_probability_at_entry,
      forecast_probability: body.forecast_probability,
      thesis: String(body.thesis).slice(0, 5000),
      source_urls: Array.isArray(body.source_urls) ? body.source_urls.filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u)).slice(0, 10) : []
    });
    return sendJson(response, 201, { forecast: item });
  }

  const resolveMatch = url.pathname.match(/^\/api\/forecasts\/([a-f0-9-]+)\/resolve$/i);
  if (request.method === 'POST' && resolveMatch) {
    const body = await readBody(request);
    if (body.outcome !== 0 && body.outcome !== 1) return sendJson(response, 400, { error: 'Outcome must be 0 (No) or 1 (Yes).' });
    const item = await resolveForecast(resolveMatch[1], body.outcome);
    if (!item) return sendJson(response, 404, { error: 'Forecast not found.' });
    return sendJson(response, 200, { forecast: item, brier_score: brierScore(await readForecasts()) });
  }

  return sendJson(response, 404, { error: 'API route not found.' });
}

async function serveStatic(response, pathname) {
  const requested = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
  const resolved = path.resolve(PUBLIC_DIR, requested);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== path.join(PUBLIC_DIR, 'index.html')) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  try {
    const content = await fs.readFile(resolved);
    response.writeHead(200, { 'content-type': MIME[path.extname(resolved)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
    response.end(content);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}

function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) await handleApi(request, response, url);
      else if (request.method === 'GET') await serveStatic(response, url.pathname);
      else sendJson(response, 405, { error: 'Method not allowed.' });
    } catch (error) {
      sendJson(response, 500, { error: error.message || 'Unexpected server error.' });
    }
  });
}

function startServer(port = Number(process.env.PORT) || 3000) {
  const server = createServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`Edge Engine research lab running at http://127.0.0.1:${port}`);
    console.log('Read-only mode: no account connection, wallet access, or trade execution.');
  });
  return server;
}

module.exports = { createServer, startServer };
