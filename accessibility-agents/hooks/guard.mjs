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
 * opens when the lead reports completion: a subagent stop event that names
 * it (`agent_type` on Claude Code and Codex).
 *
 * One exception. On Claude Code the lead is usually invoked as a skill, which
 * runs inline in the same turn and has no completion event at all, so waiting
 * for SubagentStop locked UI edits for the whole session: verified live, the
 * gate refused five edits after the lead had run three times. There, the
 * manifests also mark on PostToolUse for the Skill tool, which fires once the
 * lead's instructions are loaded into the turn. That is launch rather than
 * completion, so the finalize behaviour stays the backstop.
 *
 * Antigravity has neither a skill tool nor a subagent stop event. It loads a
 * skill by reading its SKILL.md with view_file (IsSkillFile set), so its
 * manifest marks on PostToolUse for view_file when the file read is the
 * lead's SKILL.md: the same launch-time signal as on Claude Code.
 *
 * Codex is the same: its subagent events fire only for subagents, and the
 * model loads a skill by reading its SKILL.md with a shell command. Its
 * manifest marks on PostToolUse for Bash when the command reads the lead's
 * SKILL.md, and on UserPromptSubmit when the prompt names the lead with $,
 * which is how a Codex user invokes a skill explicitly.
 *
 * The Copilot CLI sends toolName and toolArgs on its camelCase events, which
 * the guard did not read, so every Copilot edit passed (#254). Copilot does
 * not document how it loads a skill, only that SKILL.md is injected, so its
 * manifests mark on every route it can take: a skill tool call, a view or
 * shell read of the lead's SKILL.md, subagentStop, and /name in the prompt.
 *
 * ## Shell writes
 *
 * The gate also reads shell commands (Bash on Claude Code and Codex,
 * run_shell_command on Gemini CLI), because sed -i, a redirect or a heredoc
 * changes a .tsx file as surely as Edit does, and Claude Code's auto mode
 * tells the model to prefer the shell for edits (#199). It finds the files a
 * command writes by reading it: redirects, tee, sed/perl -i, cp/mv, dd,
 * PowerShell's Set-Content and Out-File, and an inline interpreter script
 * that opens a path for writing. It cannot see a path built in a variable or
 * a script run by name. That is a guardrail against the ordinary edit, not a
 * sandbox; a bypass now has to be deliberate.
 *
 * Exit codes follow the common hook convention: 0 proceed, 2 block.
 * Structured decisions are emitted as JSON on stdout where the client reads it.
 *
 * Usage (from a client manifest):
 *   node hooks/guard.mjs --behaviour detect|gate|mark|persist|finalize --client claude|codex|copilot|gemini|antigravity
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

/**
 * Sixty words. Anything longer is repeating what AGENTS.md already says.
 * It names no file: a plugin install ships no AGENTS.md and the user's
 * project has none, so a pointer at one sends the model looking for nothing
 * (#219). The lead skill it names is in every install.
 */
export const REMINDER =
  'This project enforces WCAG 2.2 AA. Before editing HTML, JSX, TSX, Vue, Svelte, CSS or a template, ' +
  'dispatch the accessibility-lead skill and let it finish. Office and PDF files go to ' +
  'document-accessibility-wizard, markdown to markdown-a11y-assistant. Edits to user-facing files are ' +
  'blocked until the lead completes, including writes made through a shell command.';

/** Forty words. A refusal has to say what to do next, and nothing else. */
export const REFUSAL =
  'Accessibility review required before editing this file. Dispatch the accessibility-lead skill, let ' +
  'it finish, then retry the edit.';

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

/**
 * The tool arguments. Antigravity nests them as toolCall.args, with
 * PascalCase names (TargetFile, AbsolutePath).
 */
function toolInput(payload) {
  // The Copilot CLI's camelCase events send toolName and toolArgs (#254).
  // Reading only tool_input there meant the gate never saw the edited path
  // and let every Copilot edit through.
  const input =
    payload.tool_input ||
    payload.toolInput ||
    payload.toolArgs ||
    payload.arguments ||
    (payload.toolCall && payload.toolCall.args) ||
    {};
  if (typeof input !== 'string') return input;
  // Some clients send the arguments as a JSON string. Unparsed, the edited
  // path would be missed and the gate would wave the edit through.
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    // A patch tool may send the bare patch text rather than JSON.
    return /^\*\*\* Begin Patch/m.test(input) ? { command: input } : {};
  }
}

/** The tool a call uses, whatever the client calls the field. */
function toolNameOf(payload) {
  return (payload.toolCall && payload.toolCall.name) || payload.tool_name || payload.toolName || '';
}

/**
 * Antigravity reads a skill's SKILL.md with view_file, and Codex has the model
 * read it with a shell command. Return the skill's folder name when this call
 * read one, so mark() can recognise the lead.
 */
function skillFileRead(payload, input) {
  const tool = toolNameOf(payload);
  // Antigravity reads with view_file; the Copilot CLI with view (Read in
  // its Claude-format events).
  if (tool === 'view_file' || (CLIENT === 'copilot' && (tool === 'view' || tool === 'Read'))) {
    const file = String(input.AbsolutePath || input.path || input.file_path || '');
    const m = /[\\/]([A-Za-z0-9_-]+)[\\/]SKILL\.md$/.exec(file);
    return m ? m[1] : '';
  }
  if (
    (CLIENT === 'codex' && (tool === 'Bash' || tool === 'exec_command' || tool === 'shell')) ||
    (CLIENT === 'copilot' && SHELL_TOOLS.has(tool))
  ) {
    return leadReadIn(shellText(input.command || input.cmd || ''));
  }
  return '';
}

/**
 * The script a shell call runs. Codex may send the command as an argument
 * list, such as ["bash", "-lc", "cat ..."]: the script is what follows the
 * shell's command flag.
 */
function shellText(command) {
  if (!Array.isArray(command)) return String(command);
  const flag = command.findIndex((a) => /^(-l?c|-Command|\/c)$/i.test(String(a)));
  return (flag >= 0 ? command.slice(flag + 1) : command).join(' ');
}

/** Commands that print a file without changing it. */
const READ_COMMANDS = new Set(['cat', 'head', 'tail', 'nl', 'less', 'more', 'bat', 'sed', 'awk', 'type', 'get-content', 'gc']);

/**
 * The lead skill whose SKILL.md this shell command reads, or ''. Each part of
 * a compound command is judged on its own, and counts only when its command
 * is a plain read: mentioning the file (ls, test, git diff, grep) or writing
 * it (sed -i, Set-Content, a redirect) does not open the gate.
 */
function leadReadIn(command) {
  let cwd = '';
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    // cd into a lead's folder, then read SKILL.md by its bare name.
    const cd = /^\s*(?:cd|pushd|Set-Location|sl)\s+["']?(.*?)["']?\s*$/i.exec(segment);
    if (cd) {
      const folder = /([A-Za-z0-9_-]+)[\\/]?$/.exec(cd[1]);
      cwd = folder ? folder[1] : '';
      continue;
    }
    if (/>\s*\S*SKILL\.md/.test(segment)) continue;
    const words = segment.trim().split(/\s+/);
    while (words.length && /^(sudo|command|builtin|env|\w+=\S*)$/.test(words[0])) words.shift();
    const verb = (words[0] || '').replace(/^.*[\\/]/, '').toLowerCase();
    if (!READ_COMMANDS.has(verb)) continue;
    if (verb === 'sed' && words.some((w) => /^-[a-zA-Z]*i/.test(w) || w === '--in-place')) continue;
    for (const m of segment.matchAll(/(?:^|[\s'"\\/=])([A-Za-z0-9_-]+)[\\/]SKILL\.md(?=$|["'\s)])/g)) {
      if (LEAD_SKILLS.has(m[1])) return m[1];
    }
    if (LEAD_SKILLS.has(cwd) && /(?:^|[\s'"])(?:\.[\\/])?SKILL\.md(?=$|["'\s)])/.test(segment)) return cwd;
  }
  return '';
}

/**
 * Codex: a prompt that names the lead with $ loads it explicitly. This fires
 * when the prompt is sent, before the skill runs, like the Skill-tool route on
 * Claude Code; finalize stays the backstop.
 */
function promptNamesLead(payload) {
  // Codex names a skill with $name; the Copilot CLI with /name in the prompt.
  const sigil = { codex: '\\$', copilot: '/' }[CLIENT];
  if (!sigil) return '';
  const prompt = String(payload.prompt || '');
  const re = new RegExp(`(?:^|[^\\w$/.:-])${sigil}([A-Za-z0-9_:-]+)\\b`, 'g');
  for (const m of prompt.matchAll(re)) {
    if (LEAD_SKILLS.has(m[1])) return m[1];
  }
  return '';
}

/**
 * Codex sends apply_patch with the patch text in tool_input.command, so the
 * edited paths are the patch's file headers.
 */
function patchTargets(command) {
  const out = [];
  for (const m of String(command).matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+?)\s*$|^\*\*\* Move to: (.+?)\s*$/gm)) {
    out.push(m[1] || m[2]);
  }
  return out;
}

// ------------------------------------------------------------ shell writes

/**
 * Shell tools by the names each client gives them. A shell call can write a
 * file as surely as Edit can, and Claude Code's auto mode tells the model to
 * prefer it for edits, so a gate that watched only the edit tools was close to
 * inert there (#199).
 */
const SHELL_TOOLS = new Set(['Bash', 'bash', 'shell', 'exec_command', 'run_shell_command', 'powershell', 'PowerShell']);

/** Commands whose file arguments are all written: tee a.html, sed -i ... a.css. */
const WRITE_ALL = new Set(['tee', 'truncate', 'set-content', 'sc', 'add-content', 'ac', 'out-file', 'mv', 'move', 'move-item', 'mi', 'rename-item', 'ren']);
/** Commands that write only their last argument: cp src dest. */
const WRITE_LAST = new Set(['cp', 'copy', 'copy-item', 'cpi', 'install', 'rsync', 'ln']);
/** Commands that edit in place only with -i or --in-place. */
const IN_PLACE = new Set(['sed', 'gsed', 'perl', 'ruby']);
/** Interpreters whose inline script may open a file for writing. */
const INTERPRETERS = new Set(['python', 'python3', 'py', 'node', 'deno', 'bun', 'perl', 'ruby', 'php', 'pwsh', 'powershell']);
const SCRIPT_WRITES =
  /open\s*\([^)]*,\s*['"][^'"]*[wax+]|\.write_(?:text|bytes)\s*\(|write(?:File|FileSync)\s*\(|append(?:File|FileSync)\s*\(|createWriteStream\s*\(|copyFile(?:Sync)?\s*\(|rename(?:Sync)?\s*\(|shutil\.(?:copy\w*|move)\s*\(|os\.(?:replace|rename)\s*\(|File\.(?:write|open)\s*\(|IO\.write\s*\(|file_put_contents\s*\(|Deno\.writeTextFile|Bun\.write|Set-Content|Out-File/;

/** Heredoc bodies are data, not commands: drop them before reading the script. */
function stripHeredocs(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    out.push(lines[i]);
    const m = /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/.exec(lines[i]);
    if (!m) continue;
    while (i + 1 < lines.length && lines[i + 1].trim() !== m[2]) i += 1;
    i += 1; // the terminator line
  }
  return out.join('\n');
}

/** Words of one command segment, quotes removed. Good enough to find paths. */
function words(segment) {
  return [...segment.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

/**
 * The files a shell command writes, as far as reading it can tell: redirect
 * targets, tee, sed/perl -i, cp/mv destinations, PowerShell's Set-Content and
 * Out-File, and an interpreter one-liner that opens a quoted path for
 * writing. A path assembled in a variable, or a script run by name, is not
 * seen; that is the documented limit, and it makes a bypass deliberate rather
 * than the ordinary way an edit happens.
 */
export function shellWriteTargets(command) {
  const full = shellText(command);
  const text = stripHeredocs(full);
  const out = new Set();

  // > file, >> file, 1> file, &> file, >| file. Not 2>&1 or <.
  for (const m of text.matchAll(/(?:^|[^<>&\d-])(?:[0-9]|&)?>>?\|?\s*(?!&)(["']?)([^\s"'`;&|<>()]+)\1/g)) {
    out.add(m[2]);
  }

  let interpreter = false;
  for (const segment of text.split(/&&|\|\||[;|\n]/)) {
    const w = words(segment.trim());
    while (w.length && /^(sudo|command|builtin|env|xargs|nohup|time|\w+=\S*)$/.test(w[0])) w.shift();
    if (!w.length) continue;
    const verb = w[0].replace(/^.*[\\/]/, '').replace(/\.exe$/i, '').toLowerCase();
    const args = w.slice(1);
    const operands = args.filter((a) => !/^-/.test(a));
    if (INTERPRETERS.has(verb)) interpreter = true;
    if (IN_PLACE.has(verb) && args.some((a) => /^-[a-zA-Z]*i/.test(a) || a.startsWith('--in-place'))) {
      operands.forEach((a) => out.add(a));
    } else if (WRITE_ALL.has(verb)) {
      operands.forEach((a) => out.add(a));
    } else if (WRITE_LAST.has(verb) && operands.length) {
      out.add(operands[operands.length - 1]);
    } else if (verb === 'dd') {
      for (const a of args) if (a.startsWith('of=')) out.add(a.slice(3));
    }
  }

  // An inline script (python3 -c, node -e, or a heredoc fed to one) that
  // writes: every path-shaped word in it counts, and the caller keeps only
  // the user-facing ones. Read the full text here, since the script is often
  // the heredoc body.
  if (interpreter && SCRIPT_WRITES.test(full)) {
    for (const m of full.matchAll(/[^\s"'`(),;=<>[\]{}]+/g)) out.add(m[0]);
  }

  return [...out];
}

/** Clients name the edited path differently. Look everywhere it might be. */
/** Every path a call edits: one for most tools, several for a Codex patch. */
function targetPaths(payload) {
  const input = toolInput(payload);
  if (typeof input.command === 'string' && /^\*\*\* Begin Patch/m.test(input.command)) {
    return patchTargets(input.command);
  }
  const tool = toolNameOf(payload);
  const command = input.command ?? input.cmd;
  if (SHELL_TOOLS.has(tool) && command) return shellWriteTargets(command);
  const one = (
    input.TargetFile ||
    input.file_path ||
    input.filePath ||
    input.path ||
    input.target_file ||
    input.notebook_path ||
    payload.file_path ||
    payload.path ||
    ''
  );
  return one ? [one] : [];
}

function subagentName(payload) {
  const input = toolInput(payload);
  const skill = skillFileRead(payload, input);
  if (skill) return skill;
  // Gemini CLI loads a skill with activate_skill({ name }).
  if (payload.tool_name === 'activate_skill' && typeof input.name === 'string') return input.name;
  // A skill tool, where a client has one, names the skill it loads.
  if (/^skill$/i.test(toolNameOf(payload)) && typeof (input.skill || input.name) === 'string') {
    return input.skill || input.name;
  }
  return (
    payload.agent_type ||
    payload.agentType ||
    payload.subagent_type ||
    payload.subagentType ||
    payload.agent ||
    payload.agent_name ||
    payload.agentName ||
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
let CLIENT = '';
let wrote = false;
const write = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...rest) => {
  wrote = true;
  return write(chunk, ...rest);
};

function emitContext(text, event) {
  if (CLIENT === 'antigravity') {
    // PreInvocation output: steps to inject before the model runs.
    process.stdout.write(JSON.stringify({ injectSteps: [{ systemMessage: text }] }));
    return;
  }
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: event || 'UserPromptSubmit', additionalContext: text },
      additionalContext: text,
      systemMessage: text,
    }),
  );
}

function emitDeny(reason) {
  if (CLIENT === 'antigravity') {
    // Antigravity decides from stdout JSON; "deny" hard-blocks the tool call.
    process.stdout.write(JSON.stringify({ decision: 'deny', reason }));
    return;
  }
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
      // The Copilot CLI's camelCase preToolUse reads these at the top level.
      ...(CLIENT === 'copilot' ? { permissionDecision: 'deny', permissionDecisionReason: reason } : {}),
      decision: 'block',
      reason,
    }),
  );
}

/**
 * A Stop event has no permission decision, so it gets the top-level
 * decision/reason shape. The reason also goes to stderr, which is what a
 * client reads as the reason when it takes the exit code alone.
 */
function emitBlock(reason) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.stderr.write(`${reason}\n`);
}

function eventName(payload) {
  return payload.hook_event_name || payload.hookEventName || undefined;
}

// --------------------------------------------------------------- behaviours

function detect(payload, ids) {
  const named = promptNamesLead(payload);
  if (named) setMarker(ids, 'reviewed', `${named} named in the prompt ${new Date().toISOString()}`);
  if (hasMarker(ids, 'reminded')) return 0;
  setMarker(ids, 'reminded');
  emitContext(REMINDER, eventName(payload));
  return 0;
}

function gate(payload, ids) {
  const file = targetPaths(payload).find(isUiFile) || '';
  if (!file || hasMarker(ids, 'reviewed')) {
    // Antigravity requires a decision on every PreToolUse reply.
    if (CLIENT === 'antigravity') process.stdout.write(JSON.stringify({ decision: 'allow' }));
    return 0;
  }

  setMarker(ids, 'ui-edit-attempted', file);
  emitDeny(REFUSAL);
  // Antigravity documents its decision as stdout JSON, not an exit code, so
  // exit 0 there to make sure the JSON is read.
  return CLIENT === 'antigravity' ? 0 : 2;
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

  // Claude Code and Codex: PreCompact; Gemini CLI: PreCompress.
  if ((event.includes('compact') || event.includes('compress')) && !event.startsWith('post')) {
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
      (state.attemptedUiEdit ? ` A UI edit to ${state.attemptedUiEdit} was blocked earlier.` : ''),
    eventName(payload),
  );
  return 0;
}

/**
 * The last gate. A turn that edited a user-facing file without a completed
 * review would otherwise end with the work merged and nobody told.
 */
function finalize(payload, ids) {
  if (payload.stop_hook_active || payload.stopHookActive) return 0;
  if (!hasMarker(ids, 'ui-edit-attempted')) return 0;
  if (hasMarker(ids, 'reviewed')) return 0;
  emitBlock(
    'An edit to a user-facing file was refused because no accessibility review has run, so the edit was not ' +
      'made. Dispatch accessibility-lead and retry it, or tell the user the edit is still outstanding.',
  );
  return 2;
}

const BEHAVIOURS = { detect, gate, mark, persist, finalize };

// ---------------------------------------------------------------------- main

async function main() {
  const argv = process.argv.slice(2);
  const behaviour = argv[argv.indexOf('--behaviour') + 1];
  if (argv.includes('--client')) CLIENT = argv[argv.indexOf('--client') + 1] || '';

  if (!BEHAVIOURS[behaviour]) {
    process.stderr.write(`guard.mjs: unknown behaviour "${behaviour}"\n`);
    if (CLIENT === 'antigravity') process.stdout.write('{}');
    return 0; // never break a session over a misconfigured manifest
  }

  const payload = await readPayload();
  const ids = sessionIds(payload);

  try {
    const code = BEHAVIOURS[behaviour](payload, ids);
    // Antigravity reads a JSON object from every hook; an empty one means
    // "nothing to add".
    if (CLIENT === 'antigravity' && !wrote) process.stdout.write('{}');
    return code;
  } catch (e) {
    process.stderr.write(`guard.mjs: ${e.message}\n`);
    // An enforcement gate that crashes must not silently allow the edit it was
    // there to stop, so gate and finalize fail closed and the rest fail open.
    if (behaviour === 'gate' || behaviour === 'finalize') {
      if (CLIENT === 'antigravity') emitDeny(REFUSAL);
      return CLIENT === 'antigravity' ? 0 : 2;
    }
    if (CLIENT === 'antigravity' && !wrote) process.stdout.write('{}');
    return 0;
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
