'use strict';

const STOP_WORDS = new Set([
  'about','after','again','against','also','among','and','are','because','before','between',
  'both','but','can','could','does','each','for','from','have','into','its','more','most',
  'not','of','on','only','other','over','such','than','that','the','their','them','then',
  'there','these','they','this','those','through','under','upon','was','were','what',
  'when','where','which','while','will','with','would','your','shall','must','proposed',
  'notice','rule','rules','agency','federal','register','document','amendment','part',
  'section','united','states','department'
]);

function tokens(value) {
  return new Set(
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word) && !/^\d+$/.test(word))
  );
}

function matchEvidence(markets, documents) {
  const matches = [];
  for (const market of markets) {
    const marketTokens = tokens(`${market.title} ${market.subtitle} ${market.category}`);
    if (marketTokens.size < 2) continue;

    for (const document of documents) {
      const docTokens = tokens(`${document.title} ${document.abstract} ${document.agencies.join(' ')}`);
      const overlap = [...marketTokens].filter((word) => docTokens.has(word));
      if (overlap.length < 2) continue;

      const ageDays = document.publication_date
        ? Math.max(0, (Date.now() - new Date(document.publication_date + 'T00:00:00Z').getTime()) / 86400000)
        : 365;
      const recencyBonus = Math.max(0, 3 - ageDays / 10);
      const score = Number((overlap.length + recencyBonus).toFixed(2));
      matches.push({
        score,
        matched_terms: overlap,
        market: { ticker: market.ticker, title: market.title, probability: market.implied_probability, volume: market.volume, url: market.url },
        evidence: { document_number: document.document_number, title: document.title, publication_date: document.publication_date, agencies: document.agencies, url: document.html_url, abstract: document.abstract }
      });
    }
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, 100);
}

function brierScore(forecasts, probabilityField = 'forecast_probability') {
  const resolved = forecasts.filter((item) =>
    (item.resolved_outcome === 0 || item.resolved_outcome === 1) &&
    Number.isFinite(item[probabilityField]) &&
    item[probabilityField] >= 0 &&
    item[probabilityField] <= 1
  );
  if (!resolved.length) return null;
  const total = resolved.reduce((sum, item) => sum + Math.pow(item[probabilityField] - item.resolved_outcome, 2), 0);
  return Number((total / resolved.length).toFixed(4));
}

module.exports = { tokens, matchEvidence, brierScore };
