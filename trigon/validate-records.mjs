#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const manifestPath = resolve(root, process.argv[2] || 'trigon/manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const records = Array.isArray(manifest.records) ? manifest.records : [];
const required = [
  'record_id',
  'title',
  'record_type',
  'status',
  'test_depth',
  'claim_ceiling',
  'public_release',
  'release_gate',
  'question',
  'created_at',
  'updated_at',
  'version'
];
const allowedDepths = new Set(['light', 'medium', 'heavy']);
const allowedProtocols = new Set(['http:', 'https:']);
const seen = new Set();
const errors = [];

function fail(recordId, message) {
  errors.push(`${recordId || '[unknown record]'}: ${message}`);
}

function safeDownloadHref(href) {
  if (typeof href !== 'string' || !href.trim()) return false;
  try {
    const url = new URL(href, 'https://universalbalancetheory.ca/trigon/');
    return allowedProtocols.has(url.protocol);
  } catch {
    return false;
  }
}

for (const record of records) {
  const id = record?.record_id || '[unknown record]';

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    fail(id, 'record must be an object');
    continue;
  }

  for (const field of required) {
    if (!(field in record) || record[field] === '' || record[field] === null) {
      fail(id, `missing required field: ${field}`);
    }
  }

  if (seen.has(id)) fail(id, 'duplicate record_id');
  seen.add(id);

  if (record.public_release !== true) fail(id, 'public_release must be true');
  if (!allowedDepths.has(record.test_depth)) fail(id, 'test_depth must be light, medium, or heavy');

  const gate = record.release_gate;
  if (!gate || gate.approved !== true) fail(id, 'release_gate.approved must be true');
  for (const review of ['privacy_review', 'provenance_review', 'source_review', 'claim_review']) {
    if (gate?.[review] !== 'passed') fail(id, `release_gate.${review} must be passed`);
  }

  for (const download of Array.isArray(record.downloads) ? record.downloads : []) {
    if (!safeDownloadHref(download?.href)) fail(id, `unsafe or invalid download href: ${download?.href || '[missing]'}`);
    if (download?.checksum_sha256 && !/^[a-f0-9]{64}$/i.test(download.checksum_sha256)) {
      fail(id, `invalid SHA-256 checksum for ${download.label || download.href || 'download'}`);
    }
  }
}

if (errors.length) {
  console.error(`Trigon record validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Trigon record validation passed. ${records.length} public record(s) checked.`);
