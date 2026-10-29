/**
 * a11y-community.mjs - two enforced rules for Open Source Accessibility
 * Framework, Community actions 2 and 4.
 *
 * Rule 1 (accessibility-reports.yml): every accessibility report gets an
 * acknowledgement, a maintainer reply within 5 business days, and a documented
 * outcome before it closes; a fixed report invites the reporter to confirm.
 *
 * Rule 2 (accessibility-credits.yml): every accessibility contribution from
 * outside the maintainers gets one question about how, and whether, to credit
 * it; the contributor's own answer is recorded; a release lists the credits.
 *
 * This file is identical in every repository that uses it. What differs per
 * repository is in .github/a11y-community.json. It has no dependencies: the
 * workflows run it through actions/github-script, the release script runs it
 * with plain Node, and the tests run it against a fake client.
 *
 * Every handler re-reads the issue's comments rather than trusting one event,
 * so an event dropped by the concurrency queue is repaired by the next one.
 */

import { readFileSync } from 'node:fs';

export const LABELS = Object.freeze({
  awaiting: 'a11y: awaiting response',
  overdue: 'a11y: response overdue',
  validation: 'a11y: validation requested',
  asked: 'credit: asked',
  yes: 'credit: yes',
  anonymous: 'credit: anonymous',
  no: 'credit: no',
});

const CREDIT_LABELS = [LABELS.asked, LABELS.yes, LABELS.anonymous, LABELS.no];

/** Hidden markers that make every comment idempotent. */
export const MARKERS = Object.freeze({
  ack: '<!-- a11y-report: acknowledged -->',
  overdue: '<!-- a11y-report: overdue -->',
  outcomeNeeded: '<!-- a11y-report: outcome-needed -->',
  validation: '<!-- a11y-report: validation -->',
  creditAsk: '<!-- a11y-credit: asked -->',
});

const MAINTAINER_ASSOCIATIONS = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
const DEFAULT_BOT_LOGIN = 'github-actions[bot]';
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------- config

export function loadConfig(path) {
  return normalizeConfig(JSON.parse(readFileSync(path, 'utf8')));
}

export function normalizeConfig(raw) {
  const config = {
    accessibilityLabel: 'accessibility',
    responseBusinessDays: 5,
    creditReminderDays: 14,
    botLogin: DEFAULT_BOT_LOGIN,
    ...raw,
  };
  for (const key of ['projectName', 'installDate', 'owner', 'accessibilityDoc']) {
    if (!config[key]) throw new Error(`a11y-community.json is missing "${key}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(config.installDate)) {
    throw new Error('installDate must be YYYY-MM-DD');
  }
  return config;
}

// ---------------------------------------------------------------- helpers

export function labelNames(item) {
  return (item.labels || []).map((label) => (typeof label === 'string' ? label : label.name));
}

export function isBot(user) {
  return !user || user.type === 'Bot' || /\[bot\]$/i.test(user.login || '');
}

export function isMaintainer(association) {
  return MAINTAINER_ASSOCIATIONS.has(String(association || '').toUpperCase());
}

function isOurBot(user, config) {
  return Boolean(user) && isBot(user) && user.login === config.botLogin;
}

function hasMarker(comments, marker) {
  return comments.some((comment) => (comment.body || '').includes(marker));
}

function maintainerComments(comments) {
  return comments.filter((c) => !isBot(c.user) && isMaintainer(c.author_association));
}

/**
 * An accessibility report: an issue (not a pull request) carrying the
 * accessibility label, opened on or after the install date by someone who is
 * neither a maintainer nor a bot.
 */
export function isReport(issue, config) {
  if (!issue || issue.pull_request) return false;
  if (!labelNames(issue).includes(config.accessibilityLabel)) return false;
  if (isBot(issue.user) || isMaintainer(issue.author_association)) return false;
  return new Date(issue.created_at) >= new Date(`${config.installDate}T00:00:00Z`);
}

/**
 * The moment `days` business days (Monday to Friday, UTC) have passed since
 * `start`. A start on a weekend counts from the following Monday at 00:00.
 */
export function addBusinessDays(start, days) {
  const d = new Date(start);
  const weekend = (x) => x.getUTCDay() === 0 || x.getUTCDay() === 6;
  if (weekend(d)) {
    d.setUTCHours(0, 0, 0, 0);
    while (weekend(d)) d.setUTCDate(d.getUTCDate() + 1);
  }
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!weekend(d)) added += 1;
  }
  return d;
}

const OUTCOME_LINE = /^[ \t]*(?:[-*][ \t]+)?(?:\*\*|__)?outcome(?:\*\*|__)?[ \t]*:/im;

/**
 * Whether a closed report has a documented outcome: it was closed by a commit
 * or a merged pull request, or a maintainer wrote an "Outcome:" line after the
 * reporter's last comment. Returns a short description, or null.
 */
export async function findOutcome(client, issue, comments) {
  const timeline = await client.listTimeline(issue.number);
  const closes = timeline.filter((e) => e.event === 'closed');
  const lastClose = closes[closes.length - 1];
  if (lastClose && lastClose.commit_id) return `commit ${lastClose.commit_id.slice(0, 7)}`;
  const merged = timeline.find(
    (e) => e.event === 'cross-referenced'
      && e.source && e.source.issue && e.source.issue.pull_request
      && e.source.issue.pull_request.merged_at,
  );
  if (merged) return `pull request #${merged.source.issue.number}`;

  const reporter = issue.user && issue.user.login;
  const byReporter = comments.filter((c) => c.user && c.user.login === reporter);
  const after = byReporter.length
    ? new Date(byReporter[byReporter.length - 1].created_at)
    : new Date(issue.created_at);
  const outcome = maintainerComments(comments).find(
    (c) => new Date(c.created_at) > after && OUTCOME_LINE.test(c.body || ''),
  );
  return outcome ? 'an Outcome line' : null;
}

// ---------------------------------------------------------------- wording

function docLink(config, anchor) {
  return `${config.accessibilityDoc}${anchor ? `#${anchor}` : ''}`;
}

export function acknowledgementComment(issue, config) {
  return [
    MARKERS.ack,
    `Thank you for reporting this accessibility barrier in ${config.projectName}. Reports like this are expertise about the project, not complaints, and we are glad to have it.`,
    '',
    `A maintainer will reply within ${config.responseBusinessDays} business days with a status and a next step.`,
    '',
    `In the meantime, the [known limitations in our accessibility statement](${docLink(config, 'known-limitations')}) list workarounds for barriers we already know about.`,
    '',
    'If you have not already, these details help us reproduce the barrier. All of them are optional:',
    '',
    '- the steps that lead to it;',
    '- your operating system and its version;',
    '- the browser or app you used, and its version;',
    '- your assistive technology and its version, if you use one and choose to share it.',
    '',
    'You never need to tell us anything about yourself beyond what helps reproduce the problem.',
  ].join('\n');
}

export function overdueComment(issue, config) {
  return [
    MARKERS.overdue,
    `@${config.owner}, this accessibility report has had no reply from a maintainer for ${config.responseBusinessDays} business days. Please post a status and a next step, even if the next step is that it is not triaged yet.`,
    '',
    'To the reporter: thank you for your patience. This reminder is for the maintainers, and you do not need to do anything.',
  ].join('\n');
}

export function outcomeNeededComment(issue, config) {
  return [
    MARKERS.outcomeNeeded,
    'This accessibility report was reopened automatically because it was closed without a documented outcome. An outcome lets the reporter, and anyone who meets the same barrier, see what happened.',
    '',
    'Maintainers, to close it, do one of these:',
    '',
    `- close it from the pull request or commit that fixes it, for example with "Fixes #${issue.number}" in the pull request description; or`,
    '- add a comment with a line that starts with `Outcome:` saying what changed and in which release, or why it cannot change and what to do instead, then close the issue again.',
    '',
    `The Outcome line must come after the reporter's most recent comment. How we respond to reports is in [our accessibility statement](${docLink(config, 'how-we-respond')}).`,
  ].join('\n');
}

export function validationComment(issue) {
  return [
    MARKERS.validation,
    `@${issue.user.login}, thank you again for this report. It is closed as fixed, and the outcome is recorded above.`,
    '',
    'When the fix is available to you, would you be willing to try it and tell us whether it removes the barrier for you? There is no obligation.',
    '',
    'Replying here reopens the conversation: maintainers see replies on closed issues, and we will reopen this issue if the barrier is still there.',
  ].join('\n');
}

export function creditAskComment(login) {
  return [
    MARKERS.creditAsk,
    `@${login}, thank you for this accessibility contribution. We credit accessibility work in our release notes, but only in the way you choose, or not at all.`,
    '',
    'How would you like to be credited? Reply with one of these lines:',
    '',
    `- \`credit: @${login}\` to be credited by your GitHub handle;`,
    '- `credit: name <Name>` to be credited by a name you choose, for example `credit: name Sam Lee`;',
    '- `credit: anonymous` to have your contribution listed without a name;',
    '- `credit: no` to not be credited.',
    '',
    'We will publish nothing about you beyond the credit you choose: release notes describe the work, never the person. Only your own reply counts, and you can change your answer later by replying with another credit line.',
  ].join('\n');
}

function quoteAttr(value) {
  return String(value).replace(/["<>]/g, '').replace(/-{2,}/g, '-');
}

export function creditConfirmationComment(login, choice, replyId) {
  const attrs = [`choice="${choice.choice}"`];
  if (choice.handle) attrs.push(`handle="${quoteAttr(choice.handle)}"`);
  if (choice.name) attrs.push(`name="${quoteAttr(choice.name)}"`);
  attrs.push(`reply="${replyId}"`);
  const line = `<!-- a11y-credit: ${attrs.join(' ')} -->`;
  const change = 'You can change this at any time by replying with another credit line.';
  const text = {
    handle: `Thank you, @${login}. We will credit you as @${choice.handle} in the release notes.`,
    name: `Thank you, @${login}. We will credit you as ${choice.name} in the release notes.`,
    anonymous: `Thank you, @${login}. We will list this contribution in the release notes without your name or handle.`,
    no: `Thank you, @${login}. We will not name you in the release notes. Your contribution is no less appreciated.`,
  }[choice.choice];
  return [line, `${text} ${change}`].join('\n');
}

// ---------------------------------------------------------------- credit replies

const HANDLE = /^@([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))$/;

/**
 * Read a contributor's reply. Returns {choice, handle?, name?} or null.
 * Accepts `credit: @handle`, `credit: name <Name>` (brackets optional),
 * `credit: anonymous` and `credit: no`, on a line of its own, optionally in
 * backticks. Quoted lines (starting with ">") are ignored.
 */
export function parseCreditReply(body) {
  for (const raw of String(body || '').split(/\r?\n/)) {
    const line = raw.trim().replace(/^`+|`+$/g, '').trim();
    const m = line.match(/^credit:\s*(.+)$/i);
    if (!m) continue;
    const value = m[1].trim().replace(/[.!]+$/, '').trim();
    const handle = value.match(HANDLE);
    if (handle) return { choice: 'handle', handle: handle[1] };
    if (/^anonymous$/i.test(value)) return { choice: 'anonymous' };
    if (/^no$/i.test(value)) return { choice: 'no' };
    const name = value.match(/^name\s+(.+)$/i);
    if (name) {
      const clean = name[1]
        .replace(/^<(.*)>$/, '$1')
        .replace(/[<>"`]/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80);
      if (clean) return { choice: 'name', name: clean };
    }
  }
  return null;
}

export function parseConfirmation(body) {
  const m = String(body || '').match(/<!-- a11y-credit: (choice="[^"]*"[^>]*?) -->/);
  if (!m) return null;
  const out = {};
  for (const [, key, value] of m[1].matchAll(/(\w+)="([^"]*)"/g)) out[key] = value;
  return out;
}

function creditLabelFor(choice) {
  return { handle: LABELS.yes, name: LABELS.yes, anonymous: LABELS.anonymous, no: LABELS.no }[choice];
}

// ---------------------------------------------------------------- label edits

async function setLabels(client, item, add, remove, log) {
  const have = new Set(labelNames(item));
  for (const name of remove) {
    if (have.has(name)) {
      await client.removeLabel(item.number, name);
      have.delete(name);
      log.push(`removed label "${name}"`);
    }
  }
  const missing = add.filter((name) => !have.has(name));
  if (missing.length) {
    await client.addLabels(item.number, missing);
    log.push(`added label ${missing.map((n) => `"${n}"`).join(', ')}`);
  }
  item.labels = [...have, ...missing].map((name) => ({ name }));
}

async function comment(client, item, body, log, what) {
  await client.createComment(item.number, body);
  log.push(`commented: ${what}`);
}

// ---------------------------------------------------------------- rule 1

export async function acknowledgeReport(client, issue, config, log = []) {
  if (!isReport(issue, config) || issue.state === 'closed') return log;
  const comments = await client.listComments(issue.number);
  if (hasMarker(comments, MARKERS.ack)) return log;
  await comment(client, issue, acknowledgementComment(issue, config), log, 'acknowledgement');
  if (maintainerComments(comments).length === 0) {
    await setLabels(client, issue, [LABELS.awaiting], [], log);
  }
  return log;
}

export async function clearIfAnswered(client, issue, config, log = []) {
  if (!isReport(issue, config)) return log;
  const names = labelNames(issue);
  if (!names.includes(LABELS.awaiting) && !names.includes(LABELS.overdue)) return log;
  const comments = await client.listComments(issue.number);
  if (maintainerComments(comments).length === 0) return log;
  await setLabels(client, issue, [], [LABELS.awaiting, LABELS.overdue], log);
  return log;
}

export async function sweepOverdue(client, config, now = new Date(), log = []) {
  const open = await client.listIssues({ labels: LABELS.awaiting, state: 'open' });
  for (const issue of open) {
    if (!isReport(issue, config)) continue;
    if (labelNames(issue).includes(LABELS.overdue)) continue;
    const comments = await client.listComments(issue.number);
    const entry = [];
    if (maintainerComments(comments).length) {
      await setLabels(client, issue, [], [LABELS.awaiting], entry);
    } else {
      const ack = comments.find((c) => (c.body || '').includes(MARKERS.ack));
      const start = ack ? ack.created_at : issue.created_at;
      if (now < addBusinessDays(start, config.responseBusinessDays)) continue;
      await setLabels(client, issue, [LABELS.overdue], [], entry);
      if (!hasMarker(comments, MARKERS.overdue)) {
        await comment(client, issue, overdueComment(issue, config), entry, 'overdue reminder');
      }
    }
    log.push(...entry.map((e) => `#${issue.number}: ${e}`));
  }
  return log;
}

export async function gateClosedReport(client, issue, config, log = []) {
  if (!isReport(issue, config)) return log;
  const comments = await client.listComments(issue.number);
  const outcome = await findOutcome(client, issue, comments);
  if (!outcome) {
    await client.reopen(issue.number);
    issue.state = 'open';
    log.push('reopened: no documented outcome');
    if (!hasMarker(comments, MARKERS.outcomeNeeded)) {
      await comment(client, issue, outcomeNeededComment(issue, config), log, 'outcome needed');
    }
    return log;
  }
  log.push(`outcome found: ${outcome}`);
  const completed = !issue.state_reason || issue.state_reason === 'completed';
  const add = [];
  if (completed && !hasMarker(comments, MARKERS.validation)) {
    await comment(client, issue, validationComment(issue), log, 'validation invite');
    add.push(LABELS.validation);
  }
  await setLabels(client, issue, add, [LABELS.awaiting, LABELS.overdue], log);
  return log;
}

// ---------------------------------------------------------------- rule 2

/** Same-repository issue numbers a pull request body says it closes. */
export function closingReferences(body, fullName) {
  const refs = new Set();
  const re = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b:?\s+(?:([\w.-]+\/[\w.-]+))?#(\d+)\b/gi;
  for (const m of String(body || '').matchAll(re)) {
    if (!m[1] || m[1].toLowerCase() === String(fullName).toLowerCase()) refs.add(Number(m[2]));
  }
  return [...refs];
}

async function alreadyAsked(client, item) {
  if (labelNames(item).some((n) => CREDIT_LABELS.includes(n))) return true;
  return hasMarker(await client.listComments(item.number), MARKERS.creditAsk);
}

async function ask(client, item, log) {
  if (await alreadyAsked(client, item)) return log;
  await comment(client, item, creditAskComment(item.user.login), log, 'credit question');
  await setLabels(client, item, [LABELS.asked], [], log);
  return log;
}

export async function creditMergedPull(client, pull, config, fullName, log = []) {
  if (!pull.merged) return log;
  if (isBot(pull.user) || isMaintainer(pull.author_association)) return log;
  let qualifies = labelNames(pull).includes(config.accessibilityLabel);
  for (const number of qualifies ? [] : closingReferences(pull.body, fullName)) {
    const linked = await client.getIssue(number).catch(() => null);
    if (linked && !linked.pull_request && labelNames(linked).includes(config.accessibilityLabel)) {
      qualifies = true;
      break;
    }
  }
  if (!qualifies) return log;
  return ask(client, pull, log);
}

export async function creditClosedReport(client, issue, config, log = []) {
  if (!isReport(issue, config)) return log;
  if (issue.state_reason && issue.state_reason !== 'completed') return log;
  const comments = await client.listComments(issue.number);
  if (!(await findOutcome(client, issue, comments))) return log;
  return ask(client, issue, log);
}

export async function recordCreditReply(client, item, config, log = []) {
  if (!labelNames(item).some((n) => CREDIT_LABELS.includes(n))) return log;
  const comments = await client.listComments(item.number);
  const askAt = comments.findIndex(
    (c) => isOurBot(c.user, config) && (c.body || '').includes(MARKERS.creditAsk),
  );
  if (askAt === -1) return log;
  const contributor = item.user.login;
  let reply = null;
  let lastConfirmed = null;
  for (const c of comments.slice(askAt + 1)) {
    if (isOurBot(c.user, config)) {
      const confirmation = parseConfirmation(c.body);
      if (confirmation) lastConfirmed = confirmation.reply;
    } else if (c.user && c.user.login === contributor) {
      const choice = parseCreditReply(c.body);
      if (choice) reply = { id: String(c.id), choice };
    }
  }
  if (!reply || reply.id === lastConfirmed) return log;
  const label = creditLabelFor(reply.choice.choice);
  await setLabels(client, item, [label], CREDIT_LABELS.filter((n) => n !== label), log);
  await comment(client, item, creditConfirmationComment(contributor, reply.choice, reply.id), log, `credit recorded (${reply.choice.choice})`);
  return log;
}

// ---------------------------------------------------------------- release list

/** A YYYY-MM-DD date, or a tag or ref resolved to its commit date. */
export async function resolveSince(client, since) {
  if (/^\d{4}-\d{2}-\d{2}/.test(since)) return new Date(since.length === 10 ? `${since}T00:00:00Z` : since);
  return new Date(await client.refDate(since));
}

export async function collectCredits(client, config, since, now = new Date()) {
  const credits = [];
  for (const label of [LABELS.yes, LABELS.anonymous]) {
    const items = await client.listIssues({ labels: label, state: 'closed', since: since.toISOString() });
    for (const item of items) {
      if (!item.closed_at || new Date(item.closed_at) < since) continue;
      const comments = await client.listComments(item.number);
      const confirmations = comments
        .filter((c) => isOurBot(c.user, config))
        .map((c) => parseConfirmation(c.body))
        .filter(Boolean);
      const last = confirmations[confirmations.length - 1];
      let who = 'an anonymous contributor';
      if (label === LABELS.yes) {
        if (last && last.choice === 'name' && last.name) who = last.name;
        else who = `@${(last && last.handle) || item.user.login}`;
      }
      credits.push({
        number: item.number,
        title: item.title,
        code: Boolean(item.pull_request),
        who,
      });
    }
  }
  credits.sort((a, b) => a.number - b.number);

  const unanswered = [];
  const limit = config.creditReminderDays * DAY_MS;
  for (const item of await client.listIssues({ labels: LABELS.asked, state: 'all' })) {
    const comments = await client.listComments(item.number);
    const askComment = comments.find(
      (c) => isOurBot(c.user, config) && (c.body || '').includes(MARKERS.creditAsk),
    );
    const askedAt = new Date(askComment ? askComment.created_at : item.closed_at || item.created_at);
    if (now - askedAt > limit) {
      unanswered.push({ number: item.number, title: item.title, askedAt, url: item.html_url });
    }
  }
  unanswered.sort((a, b) => a.number - b.number);
  return { credits, unanswered };
}

function escapeMarkdown(text) {
  return String(text).replace(/([\\`*_[\]<>#])/g, '\\$1');
}

export function formatCredits({ credits }, config) {
  if (!credits.length) return '';
  const line = (c) => `- ${escapeMarkdown(c.title)} (#${c.number}), by ${c.who}`;
  const code = credits.filter((c) => c.code);
  const other = credits.filter((c) => !c.code);
  const out = [
    '### Accessibility contributions',
    '',
    `Thank you to everyone who helped make ${config.projectName} more accessible in this release.`,
  ];
  if (code.length) out.push('', 'Code contributions:', '', ...code.map(line));
  if (other.length) out.push('', 'Reports, testing, reviews and other contributions:', '', ...other.map(line));
  return `${out.join('\n')}\n`;
}

export function formatWarnings({ unanswered }, config) {
  if (!unanswered.length) return '';
  return [
    `Warning: ${unanswered.length} credit question(s) unanswered for more than ${config.creditReminderDays} days. Leave these contributors out, or ask them again in person:`,
    ...unanswered.map((u) => `- #${u.number} ${u.title} (asked ${u.askedAt.toISOString().slice(0, 10)}) ${u.url || ''}`.trimEnd()),
  ].join('\n');
}

// ---------------------------------------------------------------- GitHub client

/**
 * The client every handler uses, built on two functions: request(route,
 * params) returning response data, and paginate(route, params) returning every
 * page's items. actions/github-script supplies both; a11y-credits.mjs supplies
 * a fetch-based pair.
 */
export function makeClient({ request, paginate }, { owner, repo }) {
  const base = { owner, repo };
  return {
    getIssue: (n) => request('GET /repos/{owner}/{repo}/issues/{issue_number}', { ...base, issue_number: n }),
    listComments: (n) => paginate('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', { ...base, issue_number: n, per_page: 100 }),
    listTimeline: (n) => paginate('GET /repos/{owner}/{repo}/issues/{issue_number}/timeline', { ...base, issue_number: n, per_page: 100 }),
    listIssues: (q) => paginate('GET /repos/{owner}/{repo}/issues', { ...base, per_page: 100, ...q }),
    createComment: (n, body) => request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', { ...base, issue_number: n, body }),
    addLabels: (n, labels) => request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', { ...base, issue_number: n, labels }),
    removeLabel: async (n, name) => {
      try {
        await request('DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}', { ...base, issue_number: n, name });
      } catch (error) {
        if (error.status !== 404) throw error;
      }
    },
    reopen: (n) => request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', { ...base, issue_number: n, state: 'open' }),
    refDate: async (ref) => {
      const data = await request('GET /repos/{owner}/{repo}/commits/{ref}', { ...base, ref });
      return data.commit.committer.date;
    },
  };
}

// ---------------------------------------------------------------- dispatch

/**
 * Route one event to its handler. `rule` is "reports" or "credits", naming the
 * workflow. Events whose actor is a bot are skipped, so the workflow's own
 * reopen, comments and labels never trigger it again.
 */
export async function handleEvent({ rule, eventName, payload, client, config, fullName, now = new Date() }) {
  const log = [];
  if (eventName !== 'schedule' && eventName !== 'pull_request_target' && isBot(payload.sender)) {
    log.push(`skipped: event from bot ${payload.sender && payload.sender.login}`);
    return log;
  }
  const issue = payload.issue;
  if (rule === 'reports') {
    if (eventName === 'schedule') return sweepOverdue(client, config, now, log);
    if (eventName === 'issues' && payload.action === 'opened') return acknowledgeReport(client, issue, config, log);
    if (eventName === 'issues' && payload.action === 'labeled') {
      if (payload.label && payload.label.name === config.accessibilityLabel) {
        return acknowledgeReport(client, issue, config, log);
      }
      return log;
    }
    if (eventName === 'issues' && payload.action === 'closed') return gateClosedReport(client, issue, config, log);
    if (eventName === 'issue_comment' && payload.action === 'created' && !issue.pull_request) {
      return clearIfAnswered(client, issue, config, log);
    }
    return log;
  }
  if (rule === 'credits') {
    if (eventName === 'pull_request_target' && payload.action === 'closed') {
      return creditMergedPull(client, payload.pull_request, config, fullName, log);
    }
    if (eventName === 'issues' && payload.action === 'closed') return creditClosedReport(client, issue, config, log);
    if (eventName === 'issue_comment' && payload.action === 'created') return recordCreditReply(client, issue, config, log);
    return log;
  }
  throw new Error(`unknown rule "${rule}"`);
}

/** Entry point for actions/github-script. */
export async function runFromAction({ github, context, core }, rule) {
  const workspace = process.env.GITHUB_WORKSPACE || '.';
  const config = loadConfig(`${workspace}/.github/a11y-community.json`);
  const { owner, repo } = context.repo;
  const client = makeClient(
    {
      request: async (route, params) => (await github.request(route, params)).data,
      paginate: (route, params) => github.paginate(route, params),
    },
    { owner, repo },
  );
  const log = await handleEvent({
    rule,
    eventName: context.eventName,
    payload: context.payload,
    client,
    config,
    fullName: `${owner}/${repo}`,
  });
  for (const line of log.length ? log : ['nothing to do']) core.info(line);
}
