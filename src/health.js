'use strict';

// Local runtime check only; it does not test external data providers.
function getHealth() {
  const supported = Number(process.versions.node.split('.')[0]) >= 22;
  return {
    project: 'edge-engine',
    status: supported ? 'ok' : 'error',
    scope: 'local-runtime',
    mode: 'read-only-paper-research',
    trading_enabled: false,
    node: process.version,
    message: supported
      ? 'Local runtime is supported. Start the app to test public data providers.'
      : 'Node.js 22 or newer is required.'
  };
}

module.exports = { getHealth };
