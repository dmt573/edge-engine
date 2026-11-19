# Edge Engine — Evidence Lab

A dependency-free Node.js research application that compares public Kalshi market listings with recent U.S. Federal Register documents, records manual probability forecasts, and measures forecast accuracy.

**Current scope:** read-only market and public-record research plus a local paper-forecast ledger. It does not place trades, connect exchange accounts or wallets, estimate a proven trading edge, or guarantee that a keyword match is economically meaningful.

## Requirements

- Node.js 22 or newer
- Internet connection for public data-source scans
- No npm packages, API keys, paid data subscriptions, brokerage accounts, or wallet connections

## Run locally

```sh
git clone https://github.com/dmt573/edge-engine.git
cd edge-engine
npm run health
npm start
```

Open http://127.0.0.1:3000 in your browser.

If you already cloned the repository, update your clean checkout with:

```sh
git pull --ff-only origin research/read-only-signal-lab
```

To run the tests:

```sh
npm test
```

## What it does

1. **Kalshi public market data:** requests up to 100 open markets from the public REST API.
2. **Federal Register:** retrieves up to 50 recent public documents.
3. **Evidence radar:** finds market/document pairs with at least two overlapping meaningful keywords. The score is a simple ranking heuristic, not an AI conclusion, causal relationship, or trading signal.
4. **Paper forecast ledger:** lets you record your probability estimate, the market's probability at entry (if available), and your written thesis.
5. **Calibration:** when an event resolves, manually record YES or NO. The app calculates the Brier score across resolved forecasts. Lower is better; 0 is perfect and 1 is worst.

Forecast records are saved locally in data/forecasts.json, which is ignored by Git.

## Data sources

- Kalshi API: https://docs.kalshi.com/
- Federal Register API: https://www.federalregister.gov/developers/documentation/api/v1

The app displays the source links and fetch timestamp. Availability, field names, limits, and API behavior can change. A failed source is reported separately so the other source can still be used.

## Important interpretation limits

- Keyword overlap can produce false positives and miss real relationships.
- A public filing or announcement does not automatically affect a market or asset price.
- Market probabilities can be affected by thin liquidity, spreads, fees, and rapidly changing information.
- Forecast calibration is not the same as trading profitability.
- The ledger does not currently calculate realized returns, fees, slippage, executable fills, or out-of-sample strategy performance.
- Outcomes are manually entered; verify settlement rules before resolving a forecast.
- No live trading, account connection, wallet connection, or automated order execution exists in this version.

## Project layout

| Path | Purpose |
| --- | --- |
| index.js | Starts the local dashboard or runs the health check |
| src/server.js | HTTP server and API routes |
| src/sources/kalshi.js | Public Kalshi market-data reader |
| src/sources/federal-register.js | Federal Register document reader |
| src/scoring.js | Keyword matching and Brier score |
| src/store.js | Local paper-forecast storage |
| public/ | Browser dashboard |
| test/ | Automated unit tests |
| data/forecasts.json | Local forecast history, created at runtime |

## Next validation milestone

Do not add paid data feeds or live trading until the paper ledger contains enough timestamped forecasts to evaluate calibration, baseline comparisons, and whether any signal produces a repeatable advantage after realistic fees and execution assumptions.
