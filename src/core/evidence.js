'use strict';

function createEvidence(input) {
  const required = ['source', 'sourceId', 'recordType', 'title', 'url', 'observedAt'];
  for (const key of required) {
    if (!input[key]) throw new Error(`Evidence is missing required field: ${key}`);
  }
  return {
    id: `${input.source}:${input.sourceId}`,
    source: input.source,
    sourceId: String(input.sourceId),
    recordType: input.recordType,
    title: String(input.title).slice(0, 1000),
    summary: String(input.summary || '').slice(0, 5000),
    url: input.url,
    publishedAt: input.publishedAt || null,
    observedAt: input.observedAt,
    chain: input.chain || null,
    assetAddress: input.assetAddress || null,
    data: input.data || {},
    limitations: input.limitations || [],
  };
}

module.exports = { createEvidence };
