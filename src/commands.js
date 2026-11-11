'use strict';

const { createEvidence } = require('./core/evidence');
const { searchPairs } = require('./connectors/dexscreener');
const { searchDocuments } = require('./connectors/federal-register');
const { appendEvidence, readEvidence } = require('./storage/jsonl');
const { scoreDexPair, summarizeEvidence } = require('./analysis/triage');
const { getHealth } = require('./health');
const {
  addOpportunity, updateOpportunity, logForecast, resolveForecast,
  recordCashflow, readEvents, buildReport,
} = require('./learning/ledger');

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

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

async function runCommand(argv) {
  const [command = 'help', subcommand, ...rest] = argv;
  const args = subcommand ? rest : [];
  const opts = options(args);

  if (command === 'health') {
    print(getHealth());
    return;
  }
  if (command === 'discover') {
    const limit = safeLimit(opts.limit, 30);
    const raw = await searchPairs(opts.query, limit);
    const records = raw.map(createEvidence);
    const saved = await appendEvidence(records);
    const triage = records.map(scoreDexPair).sort((a, b) => b.researchPriorityScore - a.researchPriorityScore);
    print({ command, query: opts.query, fetched: records.length, saved: saved.written, skippedDuplicates: saved.skipped, note: 'Read-only DEX pair discovery. Scores prioritize manual research; they do not predict returns.', triage });
    return;
  }
  if (command === 'regulations') {
    const term = opts.term || 'cryptocurrency';
    const records = (await searchDocuments(term, safeLimit(opts.limit, 20))).map(createEvidence);
    const saved = await appendEvidence(records);
    print({ command, term, fetched: records.length, saved: saved.written, skippedDuplicates: saved.skipped, note: 'Federal Register search results are source material, not legal advice or verified business opportunities.', records });
    return;
  }
  if (command === 'report') {
    print(summarizeEvidence(await readEvidence()));
    return;
  }
  if (command === 'opportunity') {
    if (subcommand === 'add') {
      const opportunity = await addOpportunity({
        ...opts,
        evidenceIds: opts.evidence ? opts.evidence.split(',').map((value) => value.trim()).filter(Boolean) : [],
      });
      print({ created: true, opportunity });
      return;
    }
    if (subcommand === 'list') {
      const report = buildReport(await readEvents());
      print(report.opportunities);
      return;
    }
    if (subcommand === 'update') {
      const changes = {};
      for (const key of ['status', 'notes', 'thesis', 'invalidation', 'horizon', 'catalyst']) {
        if (opts[key] !== undefined) changes[key] = opts[key];
      }
      print({ updated: true, opportunity: await updateOpportunity(opts.id, changes) });
      return;
    }
    throw new Error('Use: opportunity add|list|update. See docs/wealth-loop.md for examples.');
  }
  if (command === 'forecast') {
    if (subcommand === 'log') {
      print({ logged: true, forecast: await logForecast({
        opportunityId: opts.opportunity,
        question: opts.question,
        probability: opts.probability,
        horizon: opts.horizon,
        benchmark: opts.benchmark,
        sourceCutoff: opts['source-cutoff'],
      }) });
      return;
    }
    if (subcommand === 'resolve') {
      print({ resolved: true, forecast: await resolveForecast(opts.id, opts.outcome) });
      return;
    }
    throw new Error('Use: forecast log|resolve. See docs/wealth-loop.md for examples.');
  }
  if (command === 'cashflow' && subcommand === 'add') {
    print({ recorded: true, cashflow: await recordCashflow({
      type: opts.type,
      amount: opts.amount,
      currency: opts.currency,
      description: opts.description,
      opportunityId: opts.opportunity,
      date: opts.date,
    }) });
    return;
  }
  if (command === 'ledger' && (subcommand === 'report' || !subcommand)) {
    print(buildReport(await readEvents()));
    return;
  }
  console.log([
    'EDGE Swarm — read-only market research + personal learning ledger',
    '',
    'Evidence commands:',
    '  npm run health',
    '  npm run discover -- --query=BONK --limit=20',
    '  npm run regulations -- --term=cryptocurrency --limit=20',
    '  npm run report',
    '',
    'Revenue Learning Loop:',
    '  npm run opportunity -- add --title="..." --thesis="..." --domain=crypto',
    '  npm run opportunity -- list',
    '  npm run opportunity -- update --id=opp-XXXXXXXX --status=paper',
    '  npm run forecast -- log --opportunity=opp-XXXXXXXX --question="..." --probability=0.65 --horizon="30 days"',
    '  npm run forecast -- resolve --id=fcst-XXXXXXXX --outcome=yes',
    '  npm run cashflow -- add --type=receipt --amount=25 --description="Payment received"',
    '  npm run ledger -- report',
    '',
    'Local data: data/evidence.jsonl and data/learning-ledger.jsonl (both ignored by Git).',
    'No wallet, exchange, email, or trading connection is created. No orders are placed.',
    'See docs/wealth-loop.md for operating rules and full examples.',
  ].join('\n'));
}

module.exports = { runCommand };
