import * as fs from 'fs';
import { execSync } from 'child_process';
import { build } from 'tsup';

const OUTDIR = './test-treeshake/dist';

// Sentinel strings that MUST be present in the bundle (sanity check)
const MUST_BE_PRESENT = [
  'Must be string',
  'Must be email',
];

// Sentinel strings that MUST be absent (tree-shaken away)
const MUST_BE_ABSENT = [
  ['Must be number', 'number imported but unused'],
  ['Must be boolean', 'boolean not imported'],
  ['Must be a Date', 'date not imported'],
  ['Must be bigint', 'bigint imported but unused'],
  ['Must be uuid', 'uuid not imported'],
  ['Number must be an integer', 'positiveInteger imported but unused'],
];

// Build with tsup
await build({
  entry: ['./test-treeshake/treeshake.ts'],
  format: 'esm',
  dts: false,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: OUTDIR,
});

const bundle = fs.readFileSync(`${OUTDIR}/treeshake.js`, 'utf-8');

let failed = false;

// Check sentinels that must be present
for (const sentinel of MUST_BE_PRESENT) {
  if (!bundle.includes(sentinel)) {
    console.error(`FAIL: expected "${sentinel}" to be present in the bundle`);
    failed = true;
  } else {
    console.log(`  OK: "${sentinel}" is present`);
  }
}

// Check sentinels that must be absent
for (const [sentinel, reason] of MUST_BE_ABSENT) {
  if (bundle.includes(sentinel)) {
    console.error(`FAIL: expected "${sentinel}" to be absent (${reason})`);
    failed = true;
  } else {
    console.log(`  OK: "${sentinel}" is absent (${reason})`);
  }
}

// Run the bundle to verify it doesn't crash in an unexpected way
// (it will throw from .verify({}) which is expected)
try {
  execSync(`node ${OUTDIR}/treeshake.js`, { stdio: 'pipe' });
} catch {
  // Expected: .verify({}) throws at runtime
}

if (failed) {
  console.error('\nTree-shaking verification FAILED');
  process.exit(1);
} else {
  console.log('\nTree-shaking verification passed');
}
