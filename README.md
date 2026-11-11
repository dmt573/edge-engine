# EDGE Swarm — Personal Wealth Intelligence

A free-first, read-only research foundation for a personal market-intelligence and wealth-learning system. Edge Swarm discovers and preserves evidence from public crypto-market and federal regulatory sources. The Revenue Learning Loop records opportunities, timestamped forecasts, decisions, and actual cashflows so the system can learn from outcomes.

**This is a personal tool, not a product we are building to sell.** It is an early research prototype, not an autonomous agent, a profitable trading system, or financial advice.

## Requirements

- Node.js 22 or newer
- Git
- Internet access for public-data connector commands

No npm packages or API keys are required for the initial public-data connectors or local learning ledger.

## Setup

```sh
git clone https://github.com/dmt573/edge-engine.git
cd edge-engine
git checkout wealth-system-v0.1
node --version
npm run health
npm test
```

To update an existing checkout:

```sh
git fetch origin
git checkout wealth-system-v0.1
git pull --ff-only
```

## Edge Swarm evidence commands

Search DEX Screener for a token name, ticker, or address:

```sh
npm run discover -- --query=BONK --limit=20
```

Search Federal Register documents:

```sh
npm run regulations -- --term=cryptocurrency --limit=20
```

Review locally collected evidence:

```sh
npm run report
```

## Revenue Learning Loop commands

Create and track opportunities:

```sh
npm run opportunity -- add --title="Example market catalyst" --thesis="A specific, falsifiable thesis" --domain=crypto --market=ETH --horizon="2 weeks" --invalidation="What would prove the thesis wrong"
npm run opportunity -- list
npm run opportunity -- update --id=opp-XXXXXXXX --status=paper --notes="Observation only; no capital committed"
```

Record a probability forecast before the outcome:

```sh
npm run forecast -- log --opportunity=opp-XXXXXXXX --question="Will the defined event occur by the deadline?" --probability=0.65 --horizon="30 days" --benchmark=0.40
npm run forecast -- resolve --id=fcst-XXXXXXXX --outcome=yes
```

Record real money separately from transfers and capital:

```sh
npm run cashflow -- add --type=receipt --amount=25 --currency=USD --description="Verified payment received"
npm run cashflow -- add --type=expense --amount=3.50 --currency=USD --description="Transaction fee"
npm run ledger -- report
```

See [docs/wealth-loop.md](docs/wealth-loop.md) for definitions, accounting rules, forecast discipline, and complete examples.

## What is implemented

| Area | Current capability | Limitation |
| --- | --- | --- |
| Evidence model | Stable source IDs, source URLs, publication/observation times, structured fields and limitations | Not a full provenance/versioning database |
| DEX Screener | Read-only pair search and snapshot ingestion | No complete historical candles, holder graph, or verified execution data |
| Federal Register | Read-only keyword search for federal documents | Not a complete law corpus or legal interpretation |
| Research triage | Transparent heuristic ranking of DEX pair snapshots | Not a probability, price forecast, safety rating, or buy signal |
| Local evidence storage | JSONL persistence with stable-ID duplicate suppression | Single-user local prototype; no concurrent writer guarantees |
| Opportunity ledger | Append-only opportunity creation and updates | Manual inputs; no automated discovery-to-decision claims |
| Forecast ledger | Timestamped binary forecasts and Brier score | Forecast accuracy is not trading profitability |
| Cashflow ledger | Earned inflows, expenses, refunds, and excluded capital/transfer classifications | Not bank reconciliation, tax accounting, or proof of cash received |
| Tests | Node's built-in test runner | Tests do not establish live provider quality or trading performance |

## Safety and interpretation

- Connectors are read-only. No wallets, exchange credentials, seed phrases, private keys, signing, or order placement.
- The learning ledger is local. Its entries are only as accurate as the user-entered data.
- DEX pair activity can be delayed, incomplete, manipulated, or impossible to exit at the displayed price.
- Regulatory search results are discovery records. Verify original text, jurisdiction, legal status, effective date, amendments, and operative language.
- Research scores are triage heuristics, not probabilities or expected returns.
- Forecasts must be timestamped before outcomes. Keep rejected and missed forecasts.
- Any future paper/live execution work must separately account for fees, spread, slippage, latency, liquidity, position sizing, and exit feasibility.
- No paid infrastructure, trade, wallet connection, message, or external commitment is enabled.

## Architecture

Revenue Learning Loop is the shared operating layer: discover, preserve evidence, state a falsifiable thesis, forecast, decide, record outcomes, account for cashflows, and learn. Edge Swarm is the specialist market-intelligence layer. Other opportunity research can reuse the same evidence and learning infrastructure.

See [docs/architecture.md](docs/architecture.md), [docs/roadmap.md](docs/roadmap.md), and [docs/wealth-loop.md](docs/wealth-loop.md).

## Next milestones

1. Run the setup and tests on Devin's computer.
2. Add source-specific pagination, retry/backoff, request budgets, and freshness checks.
3. Add historical market data and robust paper forecasting with out-of-sample evaluation.
4. Expand legal and institutional sources, then connect events to affected companies/assets.
5. Add chain-specific wallet and transaction intelligence with liquidity and exit analysis.
6. Introduce a database and background jobs only when local usage demonstrates the need.

The project must earn complexity through measured utility. No live trading until there is credible out-of-sample evidence and a separate explicit authorization.
