'use strict';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreDexPair(evidence) {
  const data = evidence.data || {};
  const liquidity = Number(data.liquidityUsd || 0);
  const volume = Number(data.volume24hUsd || 0);
  const txns = data.txns24h || {};
  const txnCount = Number(txns.buys || 0) + Number(txns.sells || 0);
  const ageHours = evidence.publishedAt
    ? Math.max(0, (Date.now() - Date.parse(evidence.publishedAt)) / 3600000)
    : null;

  const liquidityPoints = clamp(Math.log10(Math.max(liquidity, 1)) * 8, 0, 40);
  const activityPoints = clamp(Math.log10(Math.max(txnCount, 1)) * 8, 0, 24);
  const volumePoints = clamp(Math.log10(Math.max(volume, 1)) * 5, 0, 20);
  const freshnessPoints = ageHours === null ? 0 : clamp(16 - Math.log2(ageHours + 1) * 3, 0, 16);
  const score = Math.round(liquidityPoints + activityPoints + volumePoints + freshnessPoints);

  const flags = [];
  if (liquidity < 25000) flags.push('low_reported_liquidity');
  if (liquidity > 0 && volume / liquidity > 10) flags.push('unusually_high_volume_to_liquidity');
  if (ageHours !== null && ageHours < 1) flags.push('very_new_pair');
  if (!data.pairAddress) flags.push('missing_pair_address');
  if (!data.assetAddress && !evidence.assetAddress) flags.push('missing_base_token_address');
  return {
    evidenceId: evidence.id,
    researchPriorityScore: score,
    label: score >= 65 ? 'review_first' : score >= 40 ? 'review_if_relevant' : 'low_initial_priority',
    riskFlags: flags,
    inputs: { liquidityUsd: liquidity, volume24hUsd: volume, transactionCount24h: txnCount, pairAgeHours: ageHours },
    interpretation: 'Heuristic research triage only. This score is not a probability, price forecast, safety rating, buy signal, or expected return.',
  };
}

function summarizeEvidence(records) {
  const bySource = {};
  for (const record of records) bySource[record.source] = (bySource[record.source] || 0) + 1;
  return { totalRecords: records.length, bySource, latest: records.slice(-10).reverse() };
}

module.exports = { scoreDexPair, summarizeEvidence };
