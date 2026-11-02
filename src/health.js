'use strict';

// This is a local runtime check, not a provider connectivity or strategy check.
function getHealth() {
  const supported = Number(process.versions.node.split('.')[0]) >= 22;

  return {
    project: 'edge-engine',
    status: supported ? 'ok' : 'error',
    scope: 'local-runtime',
    mode: 'read-only-research-prototype',
    node: process.version,
    message: supported
      ? 'Local runtime is ready. Public-data connectors run only when invoked; no background monitoring or trading is enabled.'
      : 'Node.js 22 or newer is required.',
  };
}

module.exports = { getHealth };
