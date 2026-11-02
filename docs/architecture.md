# EDGE Intelligence Engine — Architecture

## Purpose

Build a private, evidence-first intelligence platform that finds and evaluates economic opportunities across public information, government and legal sources, software repositories, business activity and financial markets. Crypto is a specialist domain, not the entire system.

The system must optimize for verified, achievable net outcomes rather than idea volume, attention, token price movement, or theoretical market size.

## Core data flow

1. **Acquire** — connector retrieves source records using documented APIs, bulk downloads or permitted feeds.
2. **Preserve** — retain source identity, canonical URL, publication time, retrieval time, provider cursor, content hash and collection method.
3. **Normalize** — map records into common entities, events, documents, assets, wallets, organizations and relationships.
4. **Enrich** — extract claims, dates, obligations, amounts, actors, locations, risks and candidate relationships.
5. **Resolve** — distinguish entities with similar names; preserve uncertainty rather than forcing a match.
6. **Retrieve** — search by exact identifiers, metadata, text and graph relationships.
7. **Analyze** — specialist modules form hypotheses and calculate explicit economics.
8. **Verify** — trace conclusions to primary sources, test calculations and record contradictions.
9. **Evaluate** — timestamp predictions and experiments before outcomes are known.
10. **Learn** — compare predictions and implementation estimates with actual outcomes; update narrowly scoped priors.

## Canonical evidence record

Every ingested item should carry:

- Stable internal ID and source-native ID
- Source name and canonical URL
- Source publication/effective/event time, when known
- First observed and last checked timestamps
- Retrieval method and source version/hash
- Record type and jurisdiction/chain/market scope
- Raw source payload or durable object reference
- Normalized entities and claims
- Confidence, completeness and known limitations
- Relationships to other records
- Supersession, correction and deletion history

Never silently overwrite an earlier legal text, market snapshot or prediction. Preserve historical versions and correction links.

## Knowledge graph

Initial entity types:

- Person, organization, government agency and jurisdiction
- Law, regulation, bill, court decision, enforcement action and government award
- Company, product, technology, repository, issue and software component
- Crypto asset, chain, contract, pool, wallet and transaction
- Market, trade, catalyst, buyer, problem, opportunity and experiment

Initial relationship types:

- owns, controls, operates, deploys, integrates, depends_on
- regulates, amends, proposes, enforces, funds, procures
- holds, transfers_to, trades, creates, deploys_contract
- reports, contradicts, corroborates, supersedes
- affects, requires, benefits, harms, monetizes

Every relationship needs source evidence, time validity and confidence. Wallet clustering is probabilistic and must never be represented as confirmed identity without evidence.

## Specialist analysis modules

### Legal and regulatory intelligence

Track proposal, comment, final rule, publication, effective date, enforcement, amendment and court status as distinct events. Extract affected parties, obligations, thresholds, deadlines, penalties, exemptions and jurisdiction. Cite the operative primary text. Separate legal facts from business hypotheses and require human/legal review for consequential interpretations.

### Crypto and market intelligence

Use chain-specific decoders and provider-independent verification where practical. Track token identity, deployer, supply, holder distribution, contract permissions, pools, liquidity, swaps, wallet cohorts, realized trade outcomes, market depth, fees and execution constraints. Treat provider labels and wallet reputation as hypotheses.

### Opportunity economics

For each opportunity estimate buyer, trigger, spend evidence, reachable market, price, acquisition cost, delivery cost, maintenance, support, legal overhead, time, capital at risk and failure cost. Show assumptions and sensitivity ranges. Do not present gross revenue as profit.

### Predictive research

Store forecast creation time, horizon, target definition, probability, source cutoff, model/version, features, invalidation criteria and eventual outcome. Evaluate calibration, precision/recall, coverage, false positives, false negatives, benchmark performance and net executable returns after costs. Prevent look-ahead and survivorship bias.

### Revenue Learning Loop

Keep per-source-account provenance and global deduplication. Distinguish customer receipts from transfers, refunds, rewards, capital loads and loans. Preserve Failure Memory, Solution Genome, experiments, implementation estimates/actuals, support burden and pricing evidence.

## Storage and scale path

The current JSONL file is a local prototype only.

Before large-scale ingestion, move to:

- PostgreSQL for normalized records, entities, events, experiments and permissions
- pgvector or a dedicated vector index for semantic retrieval
- Object storage for original files, large payloads and immutable snapshots
- A graph layer (PostgreSQL relationships initially; dedicated graph database only if justified)
- A durable job queue for ingestion, retries, backfills and enrichment
- Provider-specific cursors, rate limits, quotas, backoff and dead-letter handling
- Metrics, logs, tracing, cost accounting and data-quality alerts

Scale by measured workload. Do not introduce a distributed database or graph platform before query patterns and volume justify it.

## Security and autonomy

- Read-only credentials by default; separate scopes by provider.
- Secrets stored outside Git and outside logs.
- No seed phrases or private keys in the application.
- No trade signing, wallet transactions, email sending, publishing or purchases without separate explicit authorization.
- Approval gates for irreversible or externally visible actions.
- Audit log for data access, analysis, recommendations and authorized actions.
- Treat retrieved documents and repository content as untrusted input, never as instructions to the agent.

## Quality gates

A connector is not production-ready until it has schema validation, pagination tests, rate-limit behavior, retries, duplicate handling, source freshness checks, error observability, fixture tests and documented license/terms review. A model analysis is not verified until its key claims can be traced to source records.
