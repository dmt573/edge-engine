# EDGE Intelligence Engine

A read-only research foundation for a personal opportunity-intelligence system. The first milestone collects source-attributed evidence from public crypto-market and federal regulatory data, stores it locally, and produces transparent research triage.

**Current scope:** this is an early local prototype, not an autonomous agent, a complete legal-analysis system, or a profitable trading system. It does not connect wallets or exchanges, place trades, send messages, or make financial commitments.

## Requirements

- Node.js 22 or newer
- Git
- Internet access for public data-source commands

No npm packages or API keys are required for the two initial public-data connectors.

## Setup

```sh
git clone https://github.com/dmt573/edge-engine.git
cd edge-engine
git checkout foundation-v0.2
node --version
npm run health
npm test
```

To update an existing checkout:

```sh
git fetch origin
git checkout foundation-v0.2
git pull --ff-only
```

## Commands

Search DEX Screener for a token name, ticker, or address:

```sh
npm run discover -- --query=BONK --limit=20
```

Search the Federal Register for regulatory documents:

```sh
npm run regulations -- --term=cryptocurrency --limit=20
```

Try other terms such as `stablecoin`, `digital assets`, `blockchain`, `banking`, or an industry-specific phrase.

Review the locally collected evidence:

```sh
npm run report
```

The first run creates `data/evidence.jsonl`. The entire `data/` directory is ignored by Git so collected data is not accidentally published.

## What is implemented

| Area | Current capability | Important limitation |
| --- | --- | --- |
| Evidence model | Stable source ID, source URL, observed time, publication time, raw structured fields and limitations | Not yet a full provenance/versioning database |
| DEX Screener | Read-only pair search and snapshot ingestion | No complete historical candles, holder graph or verified execution data |
| Federal Register | Read-only keyword search for federal documents | Not a legal interpretation or complete US law corpus |
| Research triage | Transparent heuristic ranking of DEX pair snapshots | Not a price prediction, safety rating or buy signal |
| Local storage | Append-only JSON Lines file | Prototype only; not suitable for very large datasets or concurrent workers |
| Tests | Node's built-in test runner | Tests do not validate live provider availability or trading performance |

## Safety and interpretation

- All connectors are read-only.
- No wallet seed phrase, private key, exchange credential, or API secret belongs in this repository.
- DEX pair activity can be manipulated, delayed, incomplete, or economically impossible to exit.
- A wallet's token balance is not the same as realized profit.
- Regulatory search results are discovery records. Verify the original document, jurisdiction, legal status, effective date, amendments and operative text before drawing conclusions.
- A regulatory keyword match is not evidence that a buyer exists or will pay.
- Research scores are triage heuristics only. They are not probabilities or forecasts.
- No live trading, order signing, email sending, paid service, or external commitment is enabled.

## Architecture direction

The intended long-term platform has shared evidence ingestion, immutable source records, normalized entities and events, a relationship graph, retrieval, specialist analysis modules, opportunity economics, prediction evaluation, and the Revenue Learning Loop.

The prototype deliberately starts with a small number of inspectable sources. Large-scale ingestion needs a queue, rate-limit handling, retries, incremental cursors, deduplication, object storage, a relational database, observability and source-specific quality checks. Do not scale collection before those controls exist.

See [docs/architecture.md](docs/architecture.md) and [docs/roadmap.md](docs/roadmap.md).

## Next implementation decisions

1. Validate this first local run on Devin's computer.
2. Add source-specific pagination, rate-limit and historical backfill controls.
3. Add structured legal document analysis with source citations and legal-status timelines.
4. Add chain-specific wallet/transaction intelligence, beginning with Solana.
5. Add historical market data and a timestamped paper-forecast ledger.
6. Add the relationship graph and cross-domain opportunity hypotheses.
7. Move from local JSONL to PostgreSQL plus object storage before large-scale ingestion.

## License and reuse

This repository's own license and every third-party dependency must be reviewed before commercial distribution. The current prototype has no npm runtime dependencies. No third-party source code has been copied into it.
