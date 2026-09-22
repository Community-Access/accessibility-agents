#!/usr/bin/env node
/**
 * guard.mjs - the accessibility enforcement gate, for every client.
 *
 * One script, four behaviours, four client manifests that map their own event
 * names onto it. Previously each client had its own script in its own language
 * with its own subtly different marker logic, which is why a lead dispatch
 * recognised on one client was missed on another.
 *
 * ## The behaviours
 *
 *   detect   Inject the delegation reminder. Once per session, not per prompt.
 *   gate     Refuse an edit to a user-facing file until the lead has completed.
 *   mark     Record that the lead finished, which opens the gate.
 *   persist  Save phase and findings path before compaction; restore after.
 *   finalize Refuse to end a turn that edited UI without a completed review.
 *
 * ## Why once per session
 *
 * The old hook injected roughly 570 tokens of reminder on every prompt. Over a
 * forty-turn session that is 22,000 tokens spent repeating something the model
 * read the first time. It now injects once, capped at sixty words, and the
 * marker file records that it did.
 *
 * ## Why mark on completion, not on launch
 *
 * The gate used to open when the lead was dispatched. A cancelled or failed
 * lead therefore unlocked every UI edit for the rest of the session. It now
 * opens only when the lead reports completion.
 *
 * Exit codes follow the common hook convention: 0 proceed, 2 block.
 * Structured decisions are emitted as JSON on stdout where the client reads it.
 *
 * Usage (from a client manifest):
 *   node hooks/guard.mjs --behaviour detect|gate|mark|persist|finalize --client claude|codex|copilot|gemini
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --------------------------------------------------------------- parameters

/** Files whose change a person sees and operates. */
const UI_PATTERN = /\.(html?|jsx|tsx|vue|svelte|astro|css|scss|sass|less|ejs|hbs|handlebars|erb|leaf|jinja2?|twig|blade\.php|razor|cshtml)$/i;

/**
 * Paths that look like UI but are not a user's interface: dependencies, build
 * output, coverage, tests and stories.
 *
 * Each directory pattern matches at the start of the path as well as after a
 * separator. Requiring a leading separator let `dist/main.css` through, which
 * is the common shape of a relative path from a repository root.
 */
const SEP = '(?:^|[\\\\/])';
const EXEMPT = [
  new RegExp(`${SEP}node_modules[\\\\/]`),
  new RegExp(`${SEP}dist[\\\\/]`),
  new RegExp(`${SEP}build[\\\\/]`),
  new RegExp(`${SEP}out[\\\\/]`),
  new RegExp(`${SEP}coverage[\\\\/]`),
  new RegExp(`${SEP}vendor[\\\\/]`),
  new RegExp(`${SEP}\\.git[\\\\/]`),
  new RegExp(`${SEP}__(?:tests?|mocks?|snapshots?)__[\\\\/]`),
  /\.(test|spec|stories)\.[jt]sx?$/i,
  /\.min\.(css|js)$/i,
];

/** Sixty words. Anything longer is repeating what AGENTS.md already says. */
export const REMINDER =
  'This project enforces WCAG 2.2 AA. Before editing HTML, JSX, TSX, Vue, Svelte, CSS or a template, ' +
  'dispatch the accessibility-lead skill and let it finish. Office and PDF files go to ' +
  'document-accessibility-wizard, markdown to markdown-a11y-assistant. Edits to user-facing files are ' +
  'blocked until the lead completes. The full contract is in AGENTS.md.';

/** Forty words. A refusal has to say what to do next, and nothing else. */
export const REFUSAL =
  'Accessibility review required before editing this file. Dispatch the accessibility-lead skill, let ' +
  'it finish, then retry the edit. This gate is described in AGENTS.md.';

const LEAD_SKILLS = new Set([
  'accessibility-lead',
  'accessibility-agents:accessibility-lead',
  'web-accessibility-wizard',
  'accessibility-agents:web-accessibility-wizard',
]);

// ------------------------------------------------------------------- session

/**
 * Markers live in one directory per session so a parallel session cannot open
 * another session's gate. Codex reports child sessions and parent threads under
 * different identifiers, so every identifier a payload carries is treated as an
 * alias of the same session; that mismatch is what previously made a valid lead
 * dispatch invisible to the edit gate.
 */
function sessionIds(payload) {
  const candidates = [
    payload.session_id,
    payload.sessionId,
    payload.parent_session_id,
    payload.parentSessionId,
    payload.thread_id,
    payload.threadId,
    payload.conversation_id,
    payload.conversationId,
    process.env.CLAUDE_SESSION_ID,
    process.env.CODEX_SESSION_ID,
    process.env.COPILOT_SESSION_ID,
  ].filter((v) => typeof v === 'string' && v.length);
  return candidates.length ? [...new Set(candidates)] : ['default'];
}

function markerDir() {
  const base = process.env.A11Y_GUARD_DIR || path.join(os.tmpdir(), 'a11y-agents-guard');
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function markerPath(id, name) {
  return path.join(markerDir(), `${sanitise(id)}.${name}`);
}

function sanitise(id) {
  return String(id).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 96);
}

function hasMarker(ids, name) {
  return ids.some((id) => fs.existsSync(markerPath(id, name)));
}

function setMarker(ids, name, contents = '') {
  for (const id of ids) {
    try {
      fs.writeFileSync(markerPath(id, name), contents || new Date().toISOString(), 'utf8');
    } catch {
      // A guard that cannot write a marker must not take the session down with
      // it. The gate stays closed, which is the safe direction.
    }
  }
}

function readMarker(ids, name) {
  for (const id of ids) {
    try {
      return fs.readFileSync(markerPath(id, name), 'utf8');
    } catch {
      /* try the next alias */
    }
  }
  return null;
}

// --------------------------------------------------------------------- input

async function readPayload() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/** Clients name the edited path differently. Look everywhere it might be. */
function targetPath(payload) {
  const input = payload.tool_input || payload.toolInput || payload.arguments || {};
  return (
    input.file_path ||
    input.filePath ||
    input.path ||
    input.target_file ||
    input.notebook_path ||
    payload.file_path ||
    payload.path ||
    ''
  );
}

function subagentName(payload) {
  const input = payload.tool_input || payload.toolInput || payload.arguments || {};
  return (
    payload.subagent_type ||
    payload.subagentType ||
    payload.agent ||
    payload.agent_name ||
    payload.name ||
    input.subagent_type ||
    input.skill ||
    ''
  );
}

function isUiFile(file) {
  if (!file) return false;
  if (EXEMPT.some((re) => re.test(file))) return false;
  return UI_PATTERN.test(file);
}

// ------------------------------------------------------------------- output

/**
 * Each client reads a different field. Emitting all of them is harmless:
 * a client ignores the keys it does not know, and the exit code carries the
 * decision for any client that reads nothing at all.
 */
function emitContext(text) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: text },
      additionalContext: text,
      systemMessage: text,
    }),
  );
}

function emitDeny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
      decision: 'block',
      reason,
    }),
  );
}

// --------------------------------------------------------------- behaviours

function detect(payload, ids) {
  if (hasMarker(ids, 'reminded')) return 0;
  setMarker(ids, 'reminded');
  emitContext(REMINDER);
  return 0;
}

function gate(payload, ids) {
  const file = targetPath(payload);
  if (!isUiFile(file)) return 0;
  if (hasMarker(ids, 'reviewed')) return 0;

  setMarker(ids, 'ui-edit-attempted', file);
  emitDeny(REFUSAL);
  return 2;
}

function mark(payload, ids) {
  const name = String(subagentName(payload)).trim();
  if (!name) return 0;
  const bare = name.includes(':') ? name.split(':').pop() : name;
  if (!LEAD_SKILLS.has(name) && !LEAD_SKILLS.has(bare)) return 0;
  setMarker(ids, 'reviewed', `${bare} completed ${new Date().toISOString()}`);
  return 0;
}

/**
 * Compaction drops the conversation but not the work. Save what an audit needs
 * to resume, and hand it back afterwards in one short line, so a wizard does
 * not restart from Phase 0 and ask the user the same questions twice.
 */
function persist(payload, ids) {
  const event = String(payload.hook_event_name || payload.hookEventName || '').toLowerCase();

  if (event.includes('compact') && !event.startsWith('post')) {
    const state = {
      reviewed: hasMarker(ids, 'reviewed'),
      attemptedUiEdit: readMarker(ids, 'ui-edit-attempted'),
      cwd: payload.cwd || process.cwd(),
      at: new Date().toISOString(),
    };
    setMarker(ids, 'state', JSON.stringify(state));
    return 0;
  }

  const saved = readMarker(ids, 'state');
  if (!saved) return 0;
  let state;
  try {
    state = JSON.parse(saved);
  } catch {
    return 0;
  }
  emitContext(
    `Accessibility session state restored. Lead review ${state.reviewed ? 'completed' : 'not yet run'}.` +
      (state.attemptedUiEdit ? ` A UI edit to ${state.attemptedUiEdit} was blocked earlier.` : '') +
      ' The contract is in AGENTS.md.',
  );
  return 0;
}

/**
 * The last gate. A turn that edited a user-facing file without a completed
 * review would otherwise end with the work merged and nobody told.
 */
function finalize(payload, ids) {
  if (!hasMarker(ids, 'ui-edit-attempted')) return 0;
  if (hasMarker(ids, 'reviewed')) return 0;
  emitDeny(
    'A user-facing file was edited without an accessibility review. Dispatch accessibility-lead and let it ' +
      'complete before finishing this turn.',
  );
  return 2;
}

const BEHAVIOURS = { detect, gate, mark, persist, finalize };

// ---------------------------------------------------------------------- main

async function main() {
  const argv = process.argv.slice(2);
  const behaviour = argv[argv.indexOf('--behaviour') + 1];

  if (!BEHAVIOURS[behaviour]) {
    process.stderr.write(`guard.mjs: unknown behaviour "${behaviour}"\n`);
    return 0; // never break a session over a misconfigured manifest
  }

  const payload = await readPayload();
  const ids = sessionIds(payload);

  try {
    return BEHAVIOURS[behaviour](payload, ids);
  } catch (e) {
    process.stderr.write(`guard.mjs: ${e.message}\n`);
    // An enforcement gate that crashes must not silently allow the edit it was
    // there to stop, so gate and finalize fail closed and the rest fail open.
    return behaviour === 'gate' || behaviour === 'finalize' ? 2 : 0;
  }
}

/**
 * Only run when invoked as a hook. measure-context.mjs imports REMINDER and
 * REFUSAL from here so the injected cost it reports is the real text rather
 * than a guess at the longest string literal in the file.
 */
function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) main().then((code) => process.exit(code));
