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

  test('opens when Claude Code reports the lead subagent stopping, by agent_type', () => {
    // Claude Code's SubagentStop payload names the subagent in agent_type.
    run('mark', { ...SESSION, hook_event_name: 'SubagentStop', agent_type: 'accessibility-agents:accessibility-lead' });
    assert.equal(run('gate', edit('src/components/Modal.tsx')).code, 0);
  });

  test('opens when the lead skill is invoked through Claude Code\'s Skill tool', () => {
    // An inline skill has no stop event. Without this, the gate stayed shut
    // for the whole session: seen live, five edits refused after three leads.
    run('mark', {
      ...SESSION,
      hook_event_name: 'PostToolUse',
      tool_name: 'Skill',
      tool_input: { skill: 'accessibility-agents:accessibility-lead' },
    });
    assert.equal(run('gate', edit('src/components/Modal.tsx')).code, 0);
  });

  test('a general-purpose subagent stopping does not open the gate', () => {
    run('mark', { ...SESSION, hook_event_name: 'SubagentStop', agent_type: 'general-purpose' });
    assert.equal(run('gate', edit('src/components/Modal.tsx')).code, 2);
  });

  test('another skill through the Skill tool does not open the gate', () => {
    run('mark', { ...SESSION, hook_event_name: 'PostToolUse', tool_name: 'Skill', tool_input: { skill: 'accessibility-agents:contrast-master' } });
    assert.equal(run('gate', edit('src/components/Modal.tsx')).code, 2);
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

describe('shell writes', () => {
  // #199: Claude Code's auto mode tells the model to edit with Bash, so a gate
  // that watched only Edit and Write let every such edit through.
  const bash = (command, extra = {}) => ({ ...SESSION, ...extra, hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });

  test('a shell command that writes a user-facing file is refused before review', () => {
    for (const command of [
      "sed -i 's/Submit/Send/' src/components/Form.tsx",
      "perl -pi -e 's/a/b/' web/styles/site.css",
      'echo "<h1>Hi</h1>" > public/index.html',
      'printf x >> src/app.css',
      "cat > src/Nav.jsx <<'EOF'\nexport default () => <nav />;\nEOF",
      'echo x | tee src/App.vue',
      'cp /tmp/draft.tsx src/pages/Home.tsx',
      'mv src/Old.svelte src/New.svelte',
      'dd if=/tmp/x of=templates/base.ejs',
      `python3 -c "open('src/App.tsx','w').write('x')"`,
      `node -e "require('fs').writeFileSync('site/index.html', '')"`,
      "python3 - <<'PY'\nfrom pathlib import Path\nPath('src/Card.jsx').write_text('x')\nPY",
      'cd web && npm run lint && sed -i "s/a/b/" views/home.erb',
      'Set-Content -Path web\\index.html -Value x',
    ]) {
      assert.equal(run('gate', bash(command, { session_id: `sh-${command.length}` })).code, 2, command);
    }
  });

  test('the argument-list form Codex sends is read too', () => {
    assert.equal(run('gate', bash(['bash', '-lc', "sed -i 's/a/b/' src/App.tsx"])).code, 2);
  });

  test('reading, testing or building UI files through the shell is not refused', () => {
    for (const command of [
      'cat src/App.tsx',
      'grep -n "<h1>" public/index.html',
      'sed -n 1,40p src/components/Form.tsx',
      'npx prettier --check src/App.tsx',
      'git diff src/App.tsx > /tmp/app.diff',
      'cp src/App.tsx /tmp/App.tsx.bak',
      'npm test 2>&1 | tee test.log',
      'npm run build > build/log.txt 2>&1',
      `python3 -c "print(open('src/App.tsx').read())"`,
      'python3 scripts/lint.py src/App.tsx > report.txt',
      "cat > notes.md <<'EOF'\nUpdated > src/App.tsx later\nEOF",
      "sed -i 's/a/b/' server/db.ts",
      'ls -la src/*.tsx',
    ]) {
      assert.equal(run('gate', bash(command)).code, 0, command);
    }
  });

  test('a shell write is allowed once the lead has run', () => {
    run('mark', { ...SESSION, hook_event_name: 'PostToolUse', tool_name: 'Skill', tool_input: { skill: 'accessibility-lead' } });
    assert.equal(run('gate', bash("sed -i 's/a/b/' src/App.tsx")).code, 0);
  });

  test('Gemini CLI run_shell_command is read the same way', () => {
    const payload = { session_id: 'gem-sh', hook_event_name: 'BeforeTool', tool_name: 'run_shell_command', tool_input: { command: 'echo x > src/App.tsx' } };
    assert.equal(run('gate', payload).code, 2);
  });

  test('every manifest that gates edits also gates the shell', () => {
    const read = (f) => JSON.parse(fs.readFileSync(path.join(HERE, '..', f), 'utf8'));
    const gateMatchers = (manifest, event) => (manifest.hooks[event] || [])
      .filter((h) => (h.hooks || []).some((c) => /--behaviour gate/.test(c.command)))
      .map((h) => h.matcher);
    for (const [file, event, shell] of [
      ['hooks/hooks.json', 'PreToolUse', 'Bash'],
      ['hooks/claude.hooks.json', 'PreToolUse', 'Bash'],
      ['.claude/settings.json', 'PreToolUse', 'Bash'],
      ['hooks/codex.hooks.json', 'PreToolUse', 'Bash'],
      ['hooks/gemini.hooks.json', 'BeforeTool', 'run_shell_command'],
    ]) {
      const matchers = gateMatchers(read(file), event);
      assert.ok(matchers.length, `${file} has no gate on ${event}`);
      for (const m of matchers) assert.ok(new RegExp(`^(?:${m})$`).test(shell), `${file} gate matcher "${m}" misses ${shell}`);
    }
  });
});

describe('hook text', () => {
  test('names no file a plugin install does not ship', () => {
    // #219: a plugin install has no AGENTS.md, and neither does the user's
    // project, so a pointer at it sent the model looking for nothing.
    const first = run('detect', { session_id: 'text-1', hook_event_name: 'UserPromptSubmit' });
    const refused = run('gate', edit('src/App.tsx', { session_id: 'text-1' }));
    run('persist', { session_id: 'text-1', hook_event_name: 'PreCompact' });
    const restored = run('persist', { session_id: 'text-1', hook_event_name: 'SessionStart' });
    for (const out of [first, refused, restored]) assert.doesNotMatch(out.stdout, /AGENTS\.md/);
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

  test('blocks a stop with decision and reason, not PreToolUse output', () => {
    run('gate', edit('src/Modal.tsx'));
    const r = run('finalize', SESSION);
    assert.equal(r.code, 2);
    assert.equal(r.json.decision, 'block');
    assert.match(r.json.reason, /accessibility-lead/);
    assert.equal(r.json.hookSpecificOutput, undefined);
  });

  test('does not refuse again while the client is continuing from a refusal', () => {
    run('gate', edit('src/Modal.tsx'));
    assert.equal(run('finalize', { ...SESSION, stop_hook_active: true }).code, 0);
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

describe('antigravity', () => {
  function runAg(behaviour, payload) {
    const result = spawnSync(process.execPath, [GUARD, '--behaviour', behaviour, '--client', 'antigravity'], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
      env: { ...process.env, A11Y_GUARD_DIR: scratch },
    });
    return { code: result.status, json: JSON.parse(result.stdout) };
  }
  const CONV = { conversationId: 'ag-conv' };
  const write = (file) => ({ ...CONV, toolCall: { name: 'write_to_file', args: { TargetFile: file, CodeContent: 'x' } } });
  const view = (file) => ({ ...CONV, toolCall: { name: 'view_file', args: { AbsolutePath: file, IsSkillFile: true } } });

  test('denies a UI edit with a decision on stdout, not an exit code', () => {
    const { code, json } = runAg('gate', write('/w/src/App.tsx'));
    assert.equal(code, 0);
    assert.equal(json.decision, 'deny');
    assert.match(json.reason, /accessibility-lead/);
  });

  test('allows a non-UI edit with an explicit decision', () => {
    assert.deepEqual(runAg('gate', write('/w/server/db.py')).json, { decision: 'allow' });
  });

  test('reading the lead SKILL.md opens the gate; another skill does not', () => {
    runAg('mark', view('/h/.gemini/config/skills/aria-specialist/SKILL.md'));
    assert.equal(runAg('gate', write('/w/src/App.tsx')).json.decision, 'deny');
    assert.deepEqual(runAg('mark', view('/h/.gemini/config/skills/accessibility-lead/SKILL.md')).json, {});
    assert.equal(runAg('gate', write('/w/src/App.tsx')).json.decision, 'allow');
  });

  test('replace_file_content is gated by TargetFile too', () => {
    const payload = { ...CONV, toolCall: { name: 'replace_file_content', args: { TargetFile: 'C:\\w\\index.html' } } };
    assert.equal(runAg('gate', payload).json.decision, 'deny');
  });

  test('injects the contract once as a system message step', () => {
    const first = runAg('detect', { ...CONV, invocationNum: 0 });
    assert.match(first.json.injectSteps[0].systemMessage, /WCAG 2\.2 AA/);
    assert.deepEqual(runAg('detect', { ...CONV, invocationNum: 1 }).json, {});
  });
});

describe('arguments sent as a JSON string', () => {
  test('a UI edit whose arguments arrive as a string is still gated', () => {
    const payload = { conversationId: 'str-args', toolCall: { name: 'write_to_file', args: JSON.stringify({ TargetFile: '/w/a.css' }) } };
    const result = spawnSync(process.execPath, [GUARD, '--behaviour', 'gate', '--client', 'antigravity'], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
      env: { ...process.env, A11Y_GUARD_DIR: scratch },
    });
    assert.equal(JSON.parse(result.stdout).decision, 'deny');
  });
});

describe('gemini', () => {
  test('activating the lead skill opens the gate; another skill does not', () => {
    const SESS = { session_id: 'gem-sess' };
    const activate = (name) => ({ ...SESS, hook_event_name: 'AfterTool', tool_name: 'activate_skill', tool_input: { name } });
    const write = { ...SESS, hook_event_name: 'BeforeTool', tool_name: 'write_file', tool_input: { file_path: 'src/App.tsx' } };
    run('mark', activate('aria-specialist'));
    assert.equal(run('gate', write).code, 2);
    run('mark', activate('accessibility-lead'));
    assert.equal(run('gate', write).code, 0);
  });
});

describe('gemini compression', () => {
  test('PreCompress saves state and SessionStart restores it', () => {
    const SESS = { session_id: 'gem-compress' };
    run('gate', { ...SESS, tool_input: { file_path: 'src/App.tsx' } });
    run('persist', { ...SESS, hook_event_name: 'PreCompress' });
    const restored = run('persist', { ...SESS, hook_event_name: 'SessionStart' });
    assert.match(restored.json.additionalContext, /blocked earlier/);
  });
});

describe('codex', () => {
  function runCx(behaviour, payload) {
    const result = spawnSync(process.execPath, [GUARD, '--behaviour', behaviour, '--client', 'codex'], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
      env: { ...process.env, A11Y_GUARD_DIR: scratch },
    });
    return { code: result.status };
  }
  const SESS = { session_id: 'cx-sess' };
  const patch = { ...SESS, hook_event_name: 'PreToolUse', tool_name: 'apply_patch', tool_input: { file_path: 'src/App.tsx' } };
  const shell = (command) => ({ ...SESS, hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command } });

  test('reading the lead SKILL.md with a shell command opens the gate', () => {
    assert.equal(runCx('gate', patch).code, 2);
    runCx('mark', shell("sed -n '1,200p' /home/u/.agents/skills/accessibility-lead/SKILL.md"));
    assert.equal(runCx('gate', patch).code, 0);
  });

  test('common ways of reading the file open the gate', () => {
    const lead = '/home/u/.agents/skills/accessibility-lead/SKILL.md';
    for (const [i, command] of [
      `cat ${lead}`,
      `head -n 200 "${lead}"`,
      `nl -ba ${lead} | sed -n '1,80p'`,
      'Get-Content C:\\Users\\u\\.agents\\skills\\accessibility-lead\\SKILL.md',
      'cat skills/accessibility-lead/SKILL.md; cp a b',
      'cat accessibility-lead/SKILL.md',
      'cd ~/.agents/skills/accessibility-lead && cat SKILL.md',
      ['bash', '-lc', `sed -n '1,200p' ${lead}`],
    ].entries()) {
      const sess = { session_id: `cx-read-${i}` };
      runCx('mark', { ...sess, tool_name: 'Bash', tool_input: { command } });
      assert.equal(runCx('gate', { ...sess, tool_name: 'apply_patch', tool_input: { file_path: 'src/App.tsx' } }).code, 0, command);
    }
  });

  test('mentioning, listing, diffing or writing the lead file does not open it', () => {
    const lead = '/home/u/.agents/skills/accessibility-lead/SKILL.md';
    for (const command of [
      'cat /home/u/.agents/skills/aria-specialist/SKILL.md',
      `echo x > ${lead}`,
      `ls -l ${lead}`,
      `test -f ${lead} && echo yes`,
      `sed -i 's/a/b/' ${lead}`,
      `git diff -- ${lead}`,
      `grep -c gate ${lead}`,
      `cat ${lead}.bak`,
      'grep -l accessibility-lead skills/*/SKILL.md',
      'cd ~/.agents/skills/aria-specialist && cat SKILL.md',
      'cd ~/.agents/skills/accessibility-lead && ls SKILL.md',
    ]) {
      runCx('mark', shell(command));
      assert.equal(runCx('gate', patch).code, 2, command);
    }
  });

  test('an apply_patch that carries only the patch text is gated by its file headers', () => {
    const body = (file) => `*** Begin Patch\n*** Update File: ${file}\n@@\n-a\n+b\n*** End Patch\n`;
    const p = (file) => ({ ...SESS, hook_event_name: 'PreToolUse', tool_name: 'apply_patch', tool_input: { command: body(file) } });
    assert.equal(runCx('gate', p('src/lib/math.ts')).code, 0);
    assert.equal(runCx('gate', p('src/components/Header.tsx')).code, 2);
    const two = `*** Begin Patch\n*** Update File: README.md\n@@\n-a\n+b\n*** Add File: web/index.html\n+<p>x</p>\n*** End Patch\n`;
    assert.equal(runCx('gate', { ...SESS, tool_name: 'apply_patch', tool_input: { command: two } }).code, 2);
  });

  test('a prompt that names the lead with $ opens it', () => {
    runCx('detect', { ...SESS, hook_event_name: 'UserPromptSubmit', prompt: 'fix the header $accessibility-lead' });
    assert.equal(runCx('gate', patch).code, 0);
  });

  test('a $ mention in brackets or quotes also opens it', () => {
    runCx('detect', { session_id: 'cx-quote', hook_event_name: 'UserPromptSubmit', prompt: 'run ($accessibility-lead) first' });
    assert.equal(runCx('gate', { session_id: 'cx-quote', tool_name: 'apply_patch', tool_input: { file_path: 'src/App.tsx' } }).code, 0);
  });

  test('a prompt that only mentions the lead in words does not', () => {
    runCx('detect', { ...SESS, hook_event_name: 'UserPromptSubmit', prompt: 'is accessibility-lead installed? costs $5' });
    assert.equal(runCx('gate', patch).code, 2);
  });

  test('the lead subagent stopping still opens it', () => {
    runCx('mark', { ...SESS, hook_event_name: 'SubagentStop', agent_type: 'accessibility-lead' });
    assert.equal(runCx('gate', patch).code, 0);
  });
});

// The Copilot CLI's camelCase events send toolName and toolArgs, and toolArgs
// may arrive as a JSON string (docs.github.com, Copilot CLI hooks reference).
// The guard used to read neither, so every Copilot edit passed the gate (#254).
describe('copilot', () => {
  function runCp(behaviour, payload) {
    const result = spawnSync(process.execPath, [GUARD, '--behaviour', behaviour, '--client', 'copilot'], {
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
    return { code: result.status, json };
  }
  const base = (n) => ({ sessionId: `cp-${n}`, timestamp: 1793233574000, cwd: '/repo' });
  const tool = (n, toolName, toolArgs) => ({ ...base(n), toolName, toolArgs });

  test('edit, create, str_replace_editor and apply_patch on a UI file are refused', () => {
    const cases = [
      ['edit', { path: 'src/App.tsx', old_str: 'a', new_str: 'b' }],
      ['create', { path: 'src/Nav.vue', file_text: '<nav></nav>' }],
      ['str_replace_editor', { command: 'str_replace', path: 'web/index.html', old_str: 'a', new_str: 'b' }],
      ['apply_patch', '*** Begin Patch\n*** Update File: src/Card.jsx\n@@\n-a\n+b\n*** End Patch'],
    ];
    for (const [i, [name, args]] of cases.entries()) {
      const r = runCp('gate', tool(`edit-${i}`, name, args));
      assert.equal(r.code, 2, name);
      assert.equal(r.json.permissionDecision, 'deny', name);
      assert.ok(r.json.permissionDecisionReason.includes('accessibility-lead'), name);
    }
  });

  test('toolArgs sent as a JSON string is parsed', () => {
    const r = runCp('gate', tool('str', 'edit', JSON.stringify({ path: 'src/App.tsx', old_str: 'a', new_str: 'b' })));
    assert.equal(r.code, 2);
  });

  test('a shell write to a UI file is refused; a non-UI edit is allowed', () => {
    assert.equal(runCp('gate', tool('sh', 'bash', { command: "sed -i 's/a/b/' src/App.tsx" })).code, 2);
    assert.equal(runCp('gate', tool('ps', 'powershell', { command: 'Set-Content -Path web/index.html -Value x' })).code, 2);
    assert.equal(runCp('gate', tool('py', 'edit', { path: 'scripts/build.py', old_str: 'a', new_str: 'b' })).code, 0);
  });

  test('every route by which Copilot can load the lead opens the gate', () => {
    const ui = (n) => tool(n, 'edit', { path: 'src/App.tsx', old_str: 'a', new_str: 'b' });
    const routes = [
      ['skill tool', 'mark', tool('r1', 'skill', { skill: 'accessibility-lead' })],
      ['skill tool, plugin name', 'mark', tool('r2', 'skill', { name: 'accessibility-agents:accessibility-lead' })],
      ['view of SKILL.md', 'mark', tool('r3', 'view', { path: '/home/u/.copilot/skills/accessibility-lead/SKILL.md' })],
      ['shell read of SKILL.md', 'mark', tool('r4', 'bash', { command: 'cat ~/.agents/skills/accessibility-lead/SKILL.md' })],
      ['subagentStop', 'mark', { ...base('r5'), agentName: 'accessibility-lead', stopReason: 'end_turn' }],
      ['/name in the prompt', 'detect', { ...base('r6'), prompt: 'Use the /accessibility-lead skill to review the header' }],
    ];
    for (const [label, behaviour, payload] of routes) {
      const n = payload.sessionId.slice(3);
      assert.equal(runCp('gate', ui(n)).code, 2, `${label}: closed before`);
      runCp(behaviour, payload);
      assert.equal(runCp('gate', ui(n)).code, 0, `${label}: open after`);
    }
  });

  test('other skills, other files and passing mentions do not open the gate', () => {
    const ui = (n) => tool(n, 'edit', { path: 'src/App.tsx', old_str: 'a', new_str: 'b' });
    const near = [
      ['mark', tool('n1', 'skill', { skill: 'aria-specialist' })],
      ['mark', tool('n2', 'view', { path: '/home/u/.copilot/skills/accessibility-lead/README.md' })],
      ['mark', tool('n3', 'bash', { command: 'ls ~/.agents/skills/accessibility-lead/SKILL.md' })],
      ['mark', { ...base('n4'), agentName: 'explore' }],
      ['detect', { ...base('n5'), prompt: 'what does accessibility-lead do?' }],
      ['detect', { ...base('n6'), prompt: 'open skills/accessibility-lead/SKILL.md' }],
    ];
    for (const [behaviour, payload] of near) {
      const n = payload.sessionId.slice(3);
      runCp(behaviour, payload);
      assert.equal(runCp('gate', ui(n)).code, 2, JSON.stringify(payload));
    }
  });
});
