# EDGE Swarm — Build Roadmap

This roadmap favors useful, testable milestones and free-first data access. No paid account, trade, wallet connection, or external commitment is assumed.

## Stage 0 — Read-only foundation (implemented on foundation-v0.2)

- [x] Canonical evidence record
- [x] DEX Screener pair search connector
- [x] Federal Register document search connector
- [x] Local JSONL persistence
- [x] Transparent heuristic triage
- [x] Unit-test starter
- [ ] Run setup and tests on Devin's computer
- [ ] Verify live provider responses and edge cases

## Stage 1 — Revenue Learning Loop bridge (implemented on wealth-system-v0.1)

- [x] Append-only opportunity event ledger
- [x] Opportunity lifecycle and status tracking
- [x] Timestamped binary forecast records
- [x] Forecast resolution and Brier score
- [x] Cashflow classifications separating earned inflows from transfers/capital/loans
- [x] Currency-separated operating cash summary
- [x] Duplicate suppression for evidence IDs
- [x] Tests for ledger lifecycle, forecast scoring, cashflow classification, and evidence deduplication
- [ ] Run full setup and tests on Devin's computer
- [ ] Add export/backup and recovery procedure
- [ ] Add source-to-opportunity links and structured review workflow

## Stage 2 — Reliable ingestion

- Add source fixtures and schema validation
- Add pagination/cursors and incremental collection
- Add retries, rate-limit handling, backoff, and request budgets
- Add content hashes and last-seen timestamps
- Add raw-response preservation and data-quality reports
- Add provider terms, attribution, and license review

Exit criteria: repeated runs do not corrupt or silently duplicate data; failures are visible and recoverable.

## Stage 3 — Crypto intelligence, Solana first

- Add token and pool identity resolution
- Add historical price/volume data with provider timestamps
- Add Solana transaction and account-event ingestion
- Add deployer and holder concentration analysis
- Add wallet cohort tracking without assuming identity
- Add realized-trade accounting, fees, and slippage
- Add liquidity and executable-exit analysis
- Add token risk checks and conflicting-source handling

Exit criteria: one token can be reconstructed from source records with clear provenance and known data gaps.

## Stage 4 — Legal and institutional intelligence

- Add Federal Register status timelines
- Add Congress bill and amendment records
- Add SEC EDGAR filings
- Add GovInfo statutes, CFR, and Federal Register bulk collections
- Add USAspending awards and procurement
- Add jurisdiction and effective-date resolution
- Extract obligations, affected parties, thresholds, and deadlines
- Build cited change summaries and testable market hypotheses

Exit criteria: a change report distinguishes proposed from final/effective requirements and links conclusions to primary text.

## Stage 5 — Cross-domain intelligence and opportunity economics

- Resolve organizations, products, assets, agencies, and wallets
- Create time-aware relationships with source evidence
- Detect corroborating and contradictory evidence
- Generate candidate second- and third-order market effects
- Score opportunity quality separately from signal strength
- Include timing, downside, fees, liquidity, slippage, and exit feasibility
- Preserve confidence, alternative explanations, and invalidation criteria

Exit criteria: every opportunity hypothesis has a traceable evidence path, alternative explanations, and explicit economics.

## Stage 6 — Forecasting and paper evaluation

- Timestamp forecasts before outcomes
- Establish base-rate and simple benchmark models
- Add out-of-sample and walk-forward evaluation
- Track Brier score and calibration by signal family
- Track false positives, missed events, and forecast coverage
- Account for spread, fees, slippage, latency, liquidity, and failed exits
- Compare signal performance against simple baselines

Exit criteria: repeatable out-of-sample evidence before any live-trading discussion.

## Stage 7 — Scale and controlled autonomy

- PostgreSQL, object storage, and durable queue
- Private dashboard and access control
- Scheduled ingestion with observability and cost limits
- Shadow workers for reversible research tasks
- Human approvals for external, irreversible, or financial actions

Exit criteria: measured reliability, bounded costs, auditability, and explicit permission boundaries.

## Current priority

Run the local commands and tests on Devin's computer. Then improve ingestion quality and build the first historical, timestamped paper-evaluation loop. Do not start paid infrastructure or broad historical backfills before the local workflow is verified.
