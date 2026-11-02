'use strict';

const { runCommand } = require('./src/commands');

runCommand(process.argv.slice(2)).catch((error) => {
  console.error(JSON.stringify({
    status: 'error',
    message: error.message,
    hint: 'Check the command arguments and internet connection. No trades or external actions were performed.',
  }, null, 2));
  process.exitCode = 1;
});
