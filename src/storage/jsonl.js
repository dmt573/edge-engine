'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_FILE = path.join(process.cwd(), 'data', 'evidence.jsonl');

async function appendEvidence(records, filePath = DEFAULT_FILE) {
  if (!records.length) return { written: 0, filePath };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const body = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  await fs.appendFile(filePath, body, 'utf8');
  return { written: records.length, filePath };
}

async function readEvidence(filePath = DEFAULT_FILE) {
  let body;
  try {
    body = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return body.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid evidence JSON on line ${index + 1}`); }
  });
}

module.exports = { appendEvidence, readEvidence, DEFAULT_FILE };
