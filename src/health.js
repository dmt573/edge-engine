'use strict';

// Local runtime check only. Add data-source checks after a provider is chosen.
function getHealth() {
  const supported = Number(process.versions.node.split('.')[0]) >= 22;

  return {
    project: 'edge-engine',
    status: supported ? 'ok' : 'error',
    scope: 'local-runtime',
    mode: 'placeholder',
    node: process.version,
    message: supported
      ? 'Starter runs locally. No market data or trading is connected.'
      : 'Node.js 22 or newer is required.',
  };
}

module.exports = { getHealth };
