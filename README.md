# edge-engine

A small, dependency-free Node.js starter that is easy to extend.

**Current status:** placeholder only. The health command checks that the local
runtime is supported and the starter can load. It does not fetch market data,
produce signals, simulate returns, or place trades. An `ok` result confirms only
this local check; it says nothing about an exchange, account, or strategy.

## Local setup

Install [Node.js](https://nodejs.org/) 22 or newer and [Git](https://git-scm.com/).
Then run these commands in Terminal or PowerShell:

```sh
git clone https://github.com/dmt573/edge-engine.git
cd edge-engine
node --version
npm run health
```

There are no dependencies to install, API keys to enter, or accounts to connect.
If you already cloned the repository, update your clean checkout with
`git pull --ff-only` instead of cloning again.

The command prints JSON containing `status: "ok"`, `scope: "local-runtime"`,
`mode: "placeholder"`, and your Node.js version. It exits with code 0 on success
or 1 for an unsupported runtime. `npm start` and `node index.js` run the same
one-shot check; they exit afterward and do not start a server or monitor.

If `node` or `npm` is not recognized, install Node.js and reopen the terminal.
If your Node.js version is below 22, upgrade it before continuing.

## Minimal layout

| Path | Purpose |
| --- | --- |
| `README.md` | Setup, scope, and open decisions |
| `package.json` | Project metadata and runnable commands |
| `index.js` | Command entry point: print health and set exit status |
| `src/health.js` | Local health result; first small application module |
| `.gitignore` | Exclude local secrets, dependencies, and logs |

Keep command wiring in `index.js` and add application modules under `src/` as
needed. No framework, database, or hosted service is required for this starter.

## Decisions needing Devin's input

These remain open; the starter does not choose them:

- **First useful task:** what exact question should the engine answer?
- **Market and data source:** which market/provider should the first read-only
  connection use, and what free access or spending limit is available?
- **Output:** terminal report, saved file, or a later dashboard?
- **Run location and frequency:** manual laptop runs or a later scheduled host?
- **Future trading scope:** remain read-only, add paper trading, or consider live
  execution later? Live execution requires a separate explicit decision and risk
  limits. Nothing here enables it.

The next implementation should be one read-only data connection with a clear
expected output, once the first task and provider are selected.

## Secrets

This repository is public. Never commit credentials or private account data.
Local `.env` files are ignored, but the starter does not load them and needs no
configuration. Add configuration only when a specific integration needs it.
