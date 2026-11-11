'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { appendEvidence, readEvidence } = require('../src/storage/jsonl');

test('evidence append skips duplicate IDs already stored and within the same batch', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'edge-evidence-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'evidence.jsonl');
  const record = { id: 'source:1', source: 'source', title: 'Record' };
  const first = await appendEvidence([record, record], file);
  const second = await appendEvidence([record, { ...record, id: 'source:2' }], file);
  assert.equal(first.written, 1);
  assert.equal(first.skipped, 1);
  assert.equal(second.written, 1);
  assert.equal(second.skipped, 1);
  assert.deepEqual((await readEvidence(file)).map((item) => item.id), ['source:1', 'source:2']);
});
