'use strict';

const BASE = 'https://external-api.kalshi.com/trade-api/v2';

async function fetchOpenMarkets(limit = 100) {
  const url = new URL('/markets', BASE);
  url.searchParams.set('limit', String(Math.min(Math.max(Number(limit) || 100, 1), 200)));
  url.searchParams.set('status', 'open');

  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'edge-engine/0.2 read-only research' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Kalshi returned HTTP ${response.status}`);
  const payload = await response.json();
  const markets = Array.isArray(payload.markets) ? payload.markets : [];

  return markets.map((market) => {
    const bid = centsOrDollars(market.yes_bid_dollars, market.yes_bid);
    const ask = centsOrDollars(market.yes_ask_dollars, market.yes_ask);
    const last = centsOrDollars(market.last_price_dollars, market.last_price);
    const midpoint = bid !== null && ask !== null ? (bid + ask) / 2 : (last ?? ask ?? bid);
    return {
      ticker: market.ticker || '',
      event_ticker: market.event_ticker || '',
      title: market.title || market.subtitle || market.ticker || 'Untitled market',
      subtitle: market.subtitle || '',
      category: market.category || '',
      status: market.status || 'unknown',
      yes_bid: bid,
      yes_ask: ask,
      last_price: last,
      implied_probability: midpoint,
      volume: Number(market.volume_fp ?? market.volume ?? 0) || 0,
      open_interest: Number(market.open_interest_fp ?? market.open_interest ?? 0) || 0,
      close_time: market.close_time || null,
      rules_primary: market.rules_primary || '',
      url: market.url || ''
    };
  });
}

function centsOrDollars(dollarValue, centsValue) {
  if (dollarValue !== undefined && dollarValue !== null && dollarValue !== '') {
    const value = Number(dollarValue);
    return Number.isFinite(value) ? value : null;
  }
  if (centsValue !== undefined && centsValue !== null && centsValue !== '') {
    const value = Number(centsValue);
    return Number.isFinite(value) ? value / 100 : null;
  }
  return null;
}

module.exports = { fetchOpenMarkets, centsOrDollars };
