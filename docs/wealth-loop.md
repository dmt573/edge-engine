# Personal Wealth Intelligence System

## Purpose

Revenue Learning Loop is the operating and learning layer. Edge Swarm is its specialist market-intelligence instrument. The system is for personal decision support and wealth building; it is not a product we are trying to sell.

The shared loop is:

1. Discover a candidate opportunity.
2. Preserve the evidence and source cutoff.
3. Write a falsifiable thesis and invalidation condition.
4. Decide whether to investigate, watch, paper-test, act, or reject.
5. Timestamp forecasts before outcomes are known.
6. Record any real cashflows separately from transfers, capital, loans, and rewards.
7. Review outcomes, forecast calibration, costs, and mistakes.
8. Allocate the next block of time and capital to the best evidence-backed opportunities.

## Current commands

Create an opportunity:

```sh
npm run opportunity -- add --title="Stablecoin policy catalyst" --thesis="A policy change may benefit named issuers or infrastructure providers" --domain=crypto --market=ETH --horizon="2-8 weeks" --invalidation="Final text excludes the relevant activity"
```

List opportunities:

```sh
npm run opportunity -- list
```

Update an opportunity:

```sh
npm run opportunity -- update --id=opp-XXXXXXXX --status=paper --notes="Paper observation only"
```

Log a binary forecast before the outcome:

```sh
npm run forecast -- log --opportunity=opp-XXXXXXXX --question="Will the defined catalyst occur by the stated date?" --probability=0.65 --horizon="30 days" --benchmark=0.40
```

Resolve it only after the outcome is knowable:

```sh
npm run forecast -- resolve --id=fcst-XXXXXXXX --outcome=yes
```

Record actual cashflows:

```sh
npm run cashflow -- add --type=receipt --amount=25 --currency=USD --description="Verified payment received" --opportunity=opp-XXXXXXXX
npm run cashflow -- add --type=expense --amount=3.50 --currency=USD --description="Transaction fee" --opportunity=opp-XXXXXXXX
```

Review the combined report:

```sh
npm run ledger -- report
```

## Accounting rules

- `receipt` and `reward` are earned inflows.
- `expense` is an operating outflow.
- `refund` offsets expenses.
- `transfer`, `capital`, `loan`, `withdrawal`, and `other` are excluded from net operating cash.
- Figures are grouped by currency; do not add different currencies together.
- This is a manual record, not a bank reconciliation or tax ledger. Verify entries against actual statements.

## Forecast discipline

A forecast must identify a specific binary question, probability, horizon, and source cutoff. Resolve it once, after the event. The Brier score is the mean squared probability error; lower is better. Compare it with a base-rate forecast and keep separate scores by signal family once enough observations exist.

Do not treat a low Brier score on a tiny or cherry-picked sample as proof of a trading edge. Forecast accuracy is not the same as executable profitability. Trading evaluation must separately include spread, fees, slippage, latency, liquidity, position limits, and exit feasibility.

## Operating rules

- Research and data connectors remain read-only.
- Paper forecasts are allowed; no order placement, wallet connection, key handling, signing, or automated trade execution is enabled.
- Never treat a heuristic priority score as probability, expected return, or a buy signal.
- Keep source IDs and links attached to every material claim.
- Preserve rejected ideas and failed forecasts; do not delete inconvenient outcomes.
- Review time spent and opportunity cost, not just money.
- No paid infrastructure or provider is required for this local ledger.
