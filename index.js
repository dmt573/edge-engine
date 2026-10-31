'use strict';

const { getHealth } = require('./src/health');

const health = getHealth();
console.log(JSON.stringify(health, null, 2));
process.exitCode = health.status === 'ok' ? 0 : 1;
