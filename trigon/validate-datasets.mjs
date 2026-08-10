#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const registryPath = resolve(root, process.argv[2] || 'trigon/datasets/dataset-registry.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
const candidates = Array.isArray(registry.candidates) ? registry.candidates : [];

const readinessStates = new Set(['READY', 'NEEDS_PREP', 'BLOCKED', 'DUPLICATE', 'ARCHIVED']);
const favoriteRunStates = new Set(['PASS', 'FAIL', 'NULL', 'AMBIGUOUS', 'MORE_TESTING', 'NOT_RUN']);
const safeProtocols = new Set(['http:', 'https:']);
const seenIds = new Set();
const errors = [];

function fail(id, message) {
  errors.push(`${id || '[unknown candidate]'}: ${message}`);
}

function safeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return safeProtocols.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

for (const candidate of candidates) {
  const id = candidate?.candidate_id || '[unknown candidate]';

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    fail(id, 'candidate must be an object');
    continue;
  }

  if (!/^TRIGON-DATA-[0-9]{4,}$/.test(candidate.candidate_id || '')) {
    fail(id, 'candidate_id must match TRIGON-DATA-NNNN');
  }

  if (seenIds.has(id)) fail(id, 'duplicate candidate_id');
  seenIds.add(id);

  if (!readinessStates.has(candidate.readiness)) fail(id, 'invalid readiness state');
  if (candidate.public_listing !== true) fail(id, 'public_listing must be true for the public registry');

  if (!safeUrl(candidate.source?.landing_page)) fail(id, 'source.landing_page must be a safe http(s) URL');

  const directUrls = Array.isArray(candidate.access?.direct_urls) ? candidate.access.direct_urls : [];
  for (const url of directUrls) {
    if (!safeUrl(url)) fail(id, `unsafe or invalid direct download URL: ${url}`);
  }

  if (candidate.access?.ingestion_ready === true && !nonEmptyArray(directUrls)) {
    fail(id, 'ingestion_ready requires at least one direct download URL');
  }

  if (candidate.access?.download_mode === 'mirrored_file' && candidate.access?.mirror_allowed !== true) {
    fail(id, 'mirrored_file requires mirror_allowed=true');
  }

  if (candidate.readiness === 'READY') {
    if (candidate.access?.access_status !== 'public') fail(id, 'READY requires public access');
    if (!['cleared', 'pending'].includes(candidate.access?.license_status)) fail(id, 'READY requires a non-restricted rights state');
    if (candidate.access?.ingestion_ready !== true) fail(id, 'READY requires ingestion_ready=true');
    if (!nonEmptyArray(candidate.trigon_test_card?.null_models)) fail(id, 'READY requires at least one null model');
    if (!candidate.trigon_test_card?.primary_metric) fail(id, 'READY requires a primary metric');
    if (!nonEmptyArray(candidate.trigon_test_card?.failure_criteria)) fail(id, 'READY requires explicit failure criteria');
  }

  if (candidate.readiness === 'BLOCKED' && !nonEmptyArray(candidate.preparation?.blockers) && !nonEmptyArray(candidate.risk_flags)) {
    fail(id, 'BLOCKED requires at least one blocker or risk flag');
  }

  if (candidate.readiness === 'DUPLICATE' && !candidate.duplicate_of) {
    fail(id, 'DUPLICATE requires duplicate_of');
  }

  if (candidate.duplicate_of && candidate.duplicate_of === candidate.candidate_id) {
    fail(id, 'duplicate_of cannot point to the same candidate_id');
  }

  if (candidate.favorite_run && !favoriteRunStates.has(candidate.favorite_run.status)) {
    fail(id, 'favorite_run.status is invalid');
  }

  const card = candidate.trigon_test_card;
  if (card?.ordinary_pi_control_required === true && !Array.isArray(card.controls)) {
    fail(id, 'ordinary_pi_control_required requires controls array');
  }
}

if (registry.candidate_count !== candidates.length) {
  fail('[registry]', `candidate_count=${registry.candidate_count} but candidates.length=${candidates.length}`);
}

if (errors.length) {
  console.error(`Trigon dataset validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Trigon dataset validation passed. ${candidates.length} candidate(s) checked.`);
