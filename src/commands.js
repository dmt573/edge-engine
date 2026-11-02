'use strict';

const { createEvidence } = require('./core/evidence');
const { searchPairs } = require('./connectors/dexscreener');
const { searchDocuments } = require('./connectors/federal-register');
const { appendEvidence, readEvidence } = require('./storage/jsonl');
const { scoreDexPair, summarizeEvidence } = require('./analysis/triage');
const { getHealth } = require('./health');

function options(args) {
  const result = {};
  for (const item of args) {
    const match = item.match(/^--([^=]+)=(.*)$/);
    if (match) result[match[1]] = match[2];
  }
  return result;
}

function safeLimit(value, fallback) {
  const parsed = Number(value || fallback);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error('Limit must be a positive whole number.');
  return Math.min(parsed, 100);
}

async function runCommand(argv) {
  const [command = 'help', ...args] = argv;
  const opts = options(args);

  if (command === 'health') {
    console.log(JSON.stringify(getHealth(), null, 2));
    return;
  }
  if (command === 'discover') {
    const limit = safeLimit(opts.limit, 30);
    const raw = await searchPairs(opts.query, limit);
    const records = raw.map(createEvidence);
    const saved = await appendEvidence(records);
    const triage = records.map(scoreDexPair).sort((a, b) => b.researchPriorityScore - a.researchPriorityScore);
    console.log(JSON.stringify({ command, query: opts.query, fetched: records.length, saved: saved.written, note: 'Read-only DEX pair discovery. Scores prioritize manual research; they do not predict returns.', triage }, null, 2));
    return;
  }
  if (command === 'regulations') {
    const term = opts.term || 'cryptocurrency';
    const records = (await searchDocuments(term, safeLimit(opts.limit, 20))).map(createEvidence);
    const saved = await appendEvidence(records);
    console.log(JSON.stringify({ command, term, fetched: records.length, saved: saved.written, note: 'Federal Register search results are source material, not legal advice or verified business opportunities.', records }, null, 2));
    return;
  }
  if (command === 'report') {
    console.log(JSON.stringify(summarizeEvidence(await readEvidence()), null, 2));
    return;
  }
  console.log([
    'edge-engine — read-only evidence collection prototype',
    '',
    'Commands:',
    '  npm run health',
    '  npm run discover -- --query=BONK --limit=20',
    '  npm run regulations -- --term=cryptocurrency --limit=20',
    '  npm run report',
    '',
    'Data is stored locally in data/evidence.jsonl (ignored by Git).',
    'No wallet, exchange, email, or trading connection is created.',
  ].join('\n'));
}

module.exports = { runCommand };
