#!/usr/bin/env node
/**
 * test-source-checker.mjs - run the source currency checker's tests.
 *
 * The checker is Python (.github/scripts/check_source_currency.py), so its
 * tests are too. This finds a Python 3 the way each platform names it and runs
 * them, so `npm run verify` covers the checker without assuming a command
 * name: Windows usually has `py` or `python`, Linux and macOS `python3`.
 *
 * Exit codes: 0 passed, 1 failed, 2 no Python 3 found (reported as skipped).
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = ['-I', '-m', 'unittest', 'discover', '-s', '.github/scripts', '-p', 'test_*.py'];

for (const [cmd, pre] of [['python3', []], ['python', []], ['py', ['-3']]]) {
  const probe = spawnSync(cmd, [...pre, '-c', 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)']);
  if (probe.error || probe.status !== 0) continue;
  const run = spawnSync(cmd, [...pre, ...ARGS], { cwd: ROOT, encoding: 'utf8' });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  process.exit(run.status === 0 ? 0 : 1);
}

console.log('SKIP  no Python 3.10 or later on PATH (tried python3, python, py -3)');
process.exit(2);
