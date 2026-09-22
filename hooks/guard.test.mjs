/**
 * guard.test.mjs - the enforcement gate, tested.
 *
 * This script is the only thing standing between a model and an unreviewed
 * edit to a user's interface. Every test below is a way it could fail open,
 * fail closed on the wrong thing, or cost tokens it should not.
 *
 * Run: node --test hooks/guard.test.mjs
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'guard.mjs');

let scratch;

function run(behaviour, payload) {
  const result = spawnSync(process.execPath, [GUARD, '--behaviour', behaviour, '--client', 'claude'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, A11Y_GUARD_DIR: scratch },
  });
  let json = null;
  try {
    json = result.stdout.trim() ? JSON.parse(result.stdout) : null;
  } catch {
    json = null;
  }
  return { code: result.status, stdout: result.stdout, json };
}

const SESSION = { session_id: 'test-session' };
const edit = (file, extra = {}) => ({ ...SESSION, ...extra, tool_input: { file_path: file } });

beforeEach(() => {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-test-'));
});

describe('detect', () => {
  test('injects the contract once, then stays quiet', () => {
    const first = run('detect', SESSION);
    assert.equal(first.code, 0);
    assert.ok(first.json, 'first prompt should inject the contract');
    assert.match(first.json.additionalContext, /WCAG 2\.2 AA/);

    const second = run('detect', SESSION);
    assert.equal(second.stdout.trim(), '', 'a second prompt must not repeat the contract');
  });

  test('the reminder stays short enough to be worth repeating never', () => {
    const { json } = run('detect', SESSION);
    const words = json.additionalContext.trim().split(/\s+/).length;
    assert.ok(words <= 70, `reminder is ${words} words; it is injected into every session and must stay brief`);
  });
});

describe('gate', () => {
  test('blocks an edit to a user-facing file before review', () => {
    const result = run('gate', edit('src/components/Modal.tsx'));
    assert.equal(result.code, 2, 'an unreviewed UI edit must be refused');
    assert.equal(result.json.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(result.json.hookSpecificOutput.permissionDecisionReason, /accessibility-lead/i);
  });

  test('the refusal says what to do next and nothing else', () => {
    const { json } = run('gate', edit('src/App.vue'));
    const words = json.hookSpecificOutput.permissionDecisionReason.trim().split(/\s+/).length;
    assert.ok(words <= 45, `refusal is ${words} words; it must name the next action and stop`);
  });

  test('allows the edit once the lead has completed', () => {
    run('mark', { ...SESSION, subagent_type: 'accessibility-lead' });
    const result = run('gate', edit('src/components/Modal.tsx'));
    assert.equal(result.code, 0, 'the gate must open after a completed review');
  });

  test('ignores files that are not user-facing', () => {
    for (const file of ['server/db.ts', 'scripts/build.mjs', 'README.md', 'package.json']) {
      assert.equal(run('gate', edit(file)).code, 0, `${file} is not an interface and must not be gated`);
    }
  });

  test('ignores build output, tests and dependencies that merely look like UI', () => {
    for (const file of [
      'node_modules/react/index.css',
      'dist/main.css',
      'build/app.html',
      'src/Modal.test.tsx',
      'src/Button.stories.tsx',
      'coverage/index.html',
    ]) {
      assert.equal(run('gate', edit(file)).code, 0, `${file} is not a user's interface and must not be gated`);
    }
  });

  test('gates every user-facing extension, not only the common ones', () => {
    for (const file of [
      'a.html', 'a.jsx', 'a.tsx', 'a.vue', 'a.svelte', 'a.astro',
      'a.css', 'a.scss', 'a.ejs', 'a.hbs', 'a.erb', 'a.leaf', 'a.twig', 'a.cshtml',
    ]) {
      assert.equal(run('gate', edit(file)).code, 2, `${file} is user-facing and must be gated`);
    }
  });

  test('a client that names the path differently is still gated', () => {
    for (const key of ['file_path', 'filePath', 'path', 'target_file']) {
      const payload = { ...SESSION, tool_input: { [key]: 'src/Page.tsx' } };
      assert.equal(run('gate', payload).code, 2, `a payload using ${key} must still be gated`);
    }
  });
});

describe('mark', () => {
  test('a completed lead opens the gate', () => {
    run('mark', { ...SESSION, subagent_type: 'accessibility-lead' });
    assert.equal(run('gate', edit('src/X.tsx')).code, 0);
  });

  test('a plugin-qualified name is recognised', () => {
    run('mark', { ...SESSION, subagent_type: 'accessibility-agents:accessibility-lead' });
    assert.equal(run('gate', edit('src/X.tsx')).code, 0);
  });

  test('an unrelated subagent does not open the gate', () => {
    run('mark', { ...SESSION, subagent_type: 'python-specialist' });
    assert.equal(run('gate', edit('src/X.tsx')).code, 2, 'only the lead may open the gate');
  });

  test('a session id alias still opens the gate for the same session', () => {
    // Codex reports child sessions and parent threads under different ids.
    // Treating them as separate sessions is what previously lost a valid review.
    run('mark', { session_id: 'child-1', parent_session_id: 'parent-1', subagent_type: 'accessibility-lead' });
    const result = run('gate', { session_id: 'parent-1', tool_input: { file_path: 'src/X.tsx' } });
    assert.equal(result.code, 0, 'a review recorded under a child session must count for its parent');
  });

  test('one session cannot open the gate of another', () => {
    run('mark', { session_id: 'session-a', subagent_type: 'accessibility-lead' });
    const other = run('gate', { session_id: 'session-b', tool_input: { file_path: 'src/X.tsx' } });
    assert.equal(other.code, 2, 'a review in one session must not unlock a different session');
  });
});

describe('finalize', () => {
  test('refuses to end a turn that edited UI without review', () => {
    run('gate', edit('src/Modal.tsx'));
    assert.equal(run('finalize', SESSION).code, 2, 'the turn must not end with an unreviewed UI edit');
  });

  test('allows a turn that touched no UI', () => {
    assert.equal(run('finalize', SESSION).code, 0);
  });

  test('allows a turn where the review completed', () => {
    run('gate', edit('src/Modal.tsx'));
    run('mark', { ...SESSION, subagent_type: 'accessibility-lead' });
    assert.equal(run('finalize', SESSION).code, 0);
  });
});

describe('persist', () => {
  test('saves state before compaction and hands it back after', () => {
    run('mark', { ...SESSION, subagent_type: 'accessibility-lead' });
    run('persist', { ...SESSION, hook_event_name: 'PreCompact' });

    const restored = run('persist', { ...SESSION, hook_event_name: 'SessionStart' });
    assert.ok(restored.json, 'state should be handed back after compaction');
    assert.match(restored.json.additionalContext, /review completed/i);
  });

  test('restoring with no saved state says nothing', () => {
    assert.equal(run('persist', { ...SESSION, hook_event_name: 'SessionStart' }).stdout.trim(), '');
  });
});

describe('robustness', () => {
  test('malformed input does not break the session', () => {
    const result = spawnSync(process.execPath, [GUARD, '--behaviour', 'detect'], {
      input: 'not json at all',
      encoding: 'utf8',
      env: { ...process.env, A11Y_GUARD_DIR: scratch },
    });
    assert.notEqual(result.status, 1, 'a malformed payload must not crash the hook');
  });

  test('an unknown behaviour is ignored rather than fatal', () => {
    const result = spawnSync(process.execPath, [GUARD, '--behaviour', 'nonsense'], {
      input: '{}',
      encoding: 'utf8',
      env: { ...process.env, A11Y_GUARD_DIR: scratch },
    });
    assert.equal(result.status, 0, 'a misconfigured manifest must not break every turn');
  });

  test('an empty payload does not gate anything', () => {
    assert.equal(run('gate', {}).code, 0, 'no file path means no edit to gate');
  });
});
