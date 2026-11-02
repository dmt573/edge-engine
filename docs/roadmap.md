# EDGE Intelligence Engine — Build Roadmap

This roadmap favors useful, testable milestones and free-first data access. No paid account, trade, wallet connection or external commitment is assumed.

## Stage 0 — Read-only foundation (started)

- [x] Repository branch isolated from main
- [x] Canonical evidence record
- [x] DEX Screener pair search connector
- [x] Federal Register document search connector
- [x] Local JSONL persistence
- [x] Transparent heuristic triage
- [x] Unit-test starter
- [ ] Run setup and tests on Devin's computer
- [ ] Verify live provider responses and edge cases

Exit criteria: commands run locally, tests pass, records include source and observation times, no secrets or trading capabilities.

## Stage 1 — Reliable ingestion

- Add schema validation and source fixtures
- Add pagination/cursors and incremental collection
- Add retries, rate-limit handling, backoff and request budgets
- Add stable deduplication and content hashes
- Add raw-response preservation and data-quality reports
- Add provider terms, attribution and license review
- Add CI test workflow

Exit criteria: repeated runs do not corrupt or silently duplicate data; failures are visible and recoverable.

## Stage 2 — Crypto intelligence, Solana first

- Add token and pool identity resolution
- Add historical price/volume data with provider timestamps
- Add Solana transaction and account-event ingestion
- Add deployer and holder concentration analysis
- Add wallet cohort tracking without assuming identity
- Add realized-trade accounting, fees and slippage
- Add liquidity and executable-exit analysis
- Add token risk checks and conflicting-source handling

Exit criteria: one token can be reconstructed from source records with clear provenance and known data gaps.

## Stage 3 — Legal and regulatory intelligence

- Add Federal Register status timelines
- Add Congress bill and amendment records
- Add SEC EDGAR filings
- Add GovInfo statutes, CFR and Federal Register bulk collections
- Add USAspending awards and procurement
- Add jurisdiction and effective-date resolution
- Extract obligations, affected parties, thresholds and deadlines
- Build cited legal change summaries and business hypotheses

Exit criteria: a legal-change report distinguishes proposed from final/effective requirements and links each conclusion to primary text.

## Stage 4 — Cross-domain knowledge graph

- Resolve organizations, products, assets and agencies
- Create time-aware relationships
- Detect corroborating and contradictory evidence
- Find new connections across regulatory, software, company and market records
- Preserve confidence and alternative explanations

Exit criteria: a generated opportunity hypothesis has a traceable evidence path, not just a narrative.

## Stage 5 — Opportunity economics and experiments

- Identify buyer, costly problem and purchase trigger
- Find spending and willingness-to-pay evidence
- Estimate net economics and capital requirements
- Rank by expected value, time-to-cash, downside and execution fit
- Create small experiments with budget, deadline, success metric and stop rule
- Track actual revenue, costs, human minutes and support

Exit criteria: every promoted opportunity has evidence of a reachable buyer and a measurable validation path.

## Stage 6 — Forecasting and paper trading

- Timestamp forecasts before outcomes
- Establish baseline models
- Add out-of-sample evaluation and walk-forward tests
- Account for fees, slippage, latency, liquidity and failed exits
- Track Brier score and calibration by signal family
- Compare with simple benchmarks
- Preserve rejected and missed signals

Exit criteria: repeatable out-of-sample evidence before any live-trading discussion.

## Stage 7 — Scale and controlled autonomy

- PostgreSQL, object storage and durable queue
- Private dashboard and access control
- Scheduled ingestion with observability and cost limits
- Shadow workers for reversible research tasks
- Human approvals for external, irreversible or financial actions

Exit criteria: measured reliability, bounded costs, auditability and explicit permission boundaries.

## Current priority

Finish Stage 0 on the user's machine. Do not start paid infrastructure or broad historical backfills before the first commands and tests run successfully.
