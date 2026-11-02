'use strict';

const ENDPOINT = 'https://api.dexscreener.com/latest/dex/search';

async function searchPairs(query, limit = 30) {
  if (!query || !query.trim()) throw new Error('A token name, symbol, or address is required.');
  const url = new URL(ENDPOINT);
  url.searchParams.set('q', query.trim());
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`DEX Screener returned HTTP ${response.status}`);
  const payload = await response.json();
  const observedAt = new Date().toISOString();
  return (payload.pairs || []).slice(0, limit).map((pair) => {
    const base = pair.baseToken || {};
    const quote = pair.quoteToken || {};
    return {
      source: 'dexscreener',
      sourceId: `${pair.chainId || 'unknown'}:${pair.pairAddress || base.address || 'unknown'}`,
      recordType: 'dex_pair_snapshot',
      title: `${base.name || 'Unknown'} (${base.symbol || '?'}) / ${quote.symbol || '?'}`,
      summary: `DEX pair snapshot for ${base.symbol || 'unknown'} on ${pair.chainId || 'unknown'}.`,
      url: pair.url || `https://dexscreener.com/${pair.chainId || ''}/${pair.pairAddress || ''}`,
      publishedAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : null,
      observedAt,
      chain: pair.chainId || null,
      assetAddress: base.address || null,
      data: {
        pairAddress: pair.pairAddress || null,
        baseToken: base,
        quoteToken: quote,
        dexId: pair.dexId || null,
        priceUsd: pair.priceUsd || null,
        liquidityUsd: pair.liquidity?.usd ?? null,
        volume24hUsd: pair.volume?.h24 ?? null,
        priceChange24hPct: pair.priceChange?.h24 ?? null,
        txns24h: pair.txns?.h24 || null,
        fdv: pair.fdv ?? null,
        marketCap: pair.marketCap ?? null,
      },
      limitations: [
        'Snapshot data can be delayed, incomplete, manipulated, or unavailable.',
        'A pair listing is not evidence of a safe token or an executable profitable trade.',
        'Wallet ownership, holder concentration, contract permissions, and exit liquidity are not verified by this endpoint.',
      ],
    };
  });
}

module.exports = { searchPairs };
