'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_FILE = path.join(process.cwd(), 'data', 'evidence.jsonl');

async function appendEvidence(records, filePath = DEFAULT_FILE) {
  if (!records.length) return { written: 0, skipped: 0, filePath };
  const existingRecords = await readEvidence(filePath);
  const seen = new Set(existingRecords.map((record) => record.id).filter(Boolean));
  const unique = [];
  let skipped = 0;
  for (const record of records) {
    if (!record.id) throw new Error('Evidence record is missing its stable ID.');
    if (seen.has(record.id)) {
      skipped += 1;
      continue;
    }
    seen.add(record.id);
    unique.push(record);
  }
  if (unique.length) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const body = unique.map((record) => JSON.stringify(record)).join('\n') + '\n';
    await fs.appendFile(filePath, body, 'utf8');
  }
  return { written: unique.length, skipped, filePath };
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
