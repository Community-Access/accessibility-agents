// Tests for a11y-community.mjs against a fake GitHub client. Run with
// node --test .github/scripts/__tests__/a11y-community.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LABELS, MARKERS, addBusinessDays, closingReferences, collectCredits, formatCredits,
  formatWarnings, handleEvent, makeClient, normalizeConfig, parseCreditReply, resolveSince,
} from '../a11y-community.mjs';

const config = normalizeConfig({
  projectName: 'Example',
  installDate: '2026-10-29',
  owner: 'accesswatch',
  accessibilityDoc: 'https://github.com/example/example/blob/main/ACCESSIBILITY.md',
});
const BOT = { login: 'github-actions[bot]', type: 'Bot' };
const REPORTER = { login: 'reporter', type: 'User' };
const MAINTAINER = { login: 'maintainer', type: 'User' };
const STRANGER = { login: 'stranger', type: 'User' };

class FakeClient {
  constructor() {
    this.items = new Map();
    this.comments = new Map();
    this.timelines = new Map();
    this.calls = [];
    this.nextId = 1000;
    this.clock = '2026-11-02T12:00:00Z';
  }
  addItem(item) {
    const full = {
      state: 'open', labels: [], author_association: 'NONE', created_at: '2026-11-02T10:00:00Z', user: REPORTER, title: `Item ${item.number}`, ...item,
    };
    full.labels = full.labels.map((l) => (typeof l === 'string' ? { name: l } : l));
    this.items.set(full.number, full);
    this.comments.set(full.number, []);
    this.timelines.set(full.number, []);
    return full;
  }
  say(number, user, body, association = 'NONE', created_at = this.clock) {
    const c = { id: this.nextId++, user, body, author_association: association, created_at };
    this.comments.get(number).push(c);
    return c;
  }
  bodies(number) { return this.comments.get(number).map((c) => c.body); }
  labels(number) { return this.items.get(number).labels.map((l) => l.name).sort(); }
  async getIssue(n) {
    if (!this.items.has(n)) { const e = new Error('Not Found'); e.status = 404; throw e; }
    return this.items.get(n);
  }
  async listComments(n) { return [...(this.comments.get(n) || [])]; }
  async listTimeline(n) { return [...(this.timelines.get(n) || [])]; }
  async listIssues({ labels, state }) {
    return [...this.items.values()].filter((i) => (state === 'all' || i.state === state)
      && i.labels.some((l) => l.name === labels));
  }
  async createComment(n, body) { this.calls.push(['comment', n]); this.say(n, BOT, body, 'NONE'); }
  async addLabels(n, labels) {
    this.calls.push(['addLabels', n, labels]);
    const item = this.items.get(n);
    for (const name of labels) if (!item.labels.some((l) => l.name === name)) item.labels.push({ name });
  }
  async removeLabel(n, name) {
    this.calls.push(['removeLabel', n, name]);
    const item = this.items.get(n);
    item.labels = item.labels.filter((l) => l.name !== name);
  }
  async reopen(n) { this.calls.push(['reopen', n]); this.items.get(n).state = 'open'; }
  async refDate(ref) { return ref === 'v1.0.0' ? '2026-11-01T00:00:00Z' : null; }
}

const report = (client, extra = {}) => client.addItem({ number: 1, labels: ['accessibility'], ...extra });
const issuesEvent = (client, action, number, extra = {}) => ({
  eventName: 'issues', payload: { action, issue: client.items.get(number), sender: REPORTER, ...extra },
});
const run = (client, rule, event, now) => handleEvent({
  rule, client, config, fullName: 'example/example', now, ...event,
});
const comments = (client, number, marker) => client.bodies(number).filter((b) => b.includes(marker));

// ---------------------------------------------------------------- acknowledge

test('a new report is acknowledged once and labelled awaiting response', async () => {
  const client = new FakeClient();
  report(client);
  await run(client, 'reports', issuesEvent(client, 'opened', 1));
  await run(client, 'reports', issuesEvent(client, 'labeled', 1, { label: { name: 'accessibility' } }));
  const acks = comments(client, 1, MARKERS.ack);
  assert.equal(acks.length, 1);
  assert.match(acks[0], /within 5 business days with a status and a next step/);
  assert.match(acks[0], /ACCESSIBILITY\.md#known-limitations/);
  assert.match(acks[0], /assistive technology and its version, if you use one and choose to share it/);
  assert.doesNotMatch(acks[0], /disabilit|diagnos/i);
  assert.deepEqual(client.labels(1), ['a11y: awaiting response', 'accessibility']);
});

test('labelling an existing issue accessibility acknowledges it the first time', async () => {
  const client = new FakeClient();
  client.addItem({ number: 1, labels: [] });
  await run(client, 'reports', issuesEvent(client, 'labeled', 1, { label: { name: 'bug' } }));
  assert.equal(client.calls.length, 0);
  client.items.get(1).labels.push({ name: 'accessibility' });
  await run(client, 'reports', issuesEvent(client, 'labeled', 1, { label: { name: 'accessibility' }, sender: MAINTAINER }));
  assert.equal(comments(client, 1, MARKERS.ack).length, 1);
});

test('maintainers, bots, pull requests and issues from before the install date are not reports', async () => {
  const client = new FakeClient();
  client.addItem({ number: 1, labels: ['accessibility'], author_association: 'MEMBER', user: MAINTAINER });
  client.addItem({ number: 2, labels: ['accessibility'], user: BOT });
  client.addItem({ number: 3, labels: ['accessibility'], pull_request: {} });
  client.addItem({ number: 4, labels: ['accessibility'], created_at: '2026-10-28T23:59:59Z' });
  for (const n of [1, 2, 3, 4]) await run(client, 'reports', issuesEvent(client, 'opened', n));
  assert.deepEqual(client.calls, []);
});

// ---------------------------------------------------------------- clear

test('a maintainer comment clears awaiting response and response overdue', async () => {
  const client = new FakeClient();
  report(client, { labels: ['accessibility', LABELS.awaiting, LABELS.overdue] });
  const event = (sender) => ({ eventName: 'issue_comment', payload: { action: 'created', issue: client.items.get(1), sender } });
  client.say(1, REPORTER, 'more detail');
  await run(client, 'reports', event(REPORTER));
  assert.deepEqual(client.calls, [], 'a reporter comment changes nothing');
  client.say(1, MAINTAINER, 'Thanks, triaging now. Severity: serious.', 'COLLABORATOR');
  await run(client, 'reports', event(MAINTAINER));
  assert.deepEqual(client.labels(1), ['accessibility']);
});

// ---------------------------------------------------------------- overdue

test('business days skip weekends', () => {
  // Monday 10:00 -> next Monday 10:00
  assert.equal(addBusinessDays('2026-11-02T10:00:00Z', 5).toISOString(), '2026-11-09T10:00:00.000Z');
  // Friday 16:00 -> next Friday 16:00
  assert.equal(addBusinessDays('2026-11-06T16:00:00Z', 5).toISOString(), '2026-11-13T16:00:00.000Z');
  // Saturday counts from Monday 00:00 -> the Monday after
  assert.equal(addBusinessDays('2026-11-07T10:00:00Z', 5).toISOString(), '2026-11-16T00:00:00.000Z');
});

test('the daily sweep marks a report overdue after 5 business days, once, mentioning the owner', async () => {
  const client = new FakeClient();
  report(client, { labels: ['accessibility', LABELS.awaiting] });
  client.say(1, BOT, `${MARKERS.ack}\nThanks`, 'NONE', '2026-11-02T10:00:00Z');
  const sweep = (now) => run(client, 'reports', { eventName: 'schedule', payload: {} }, new Date(now));
  await sweep('2026-11-06T23:00:00Z'); // Friday: 4 business days
  await sweep('2026-11-08T23:00:00Z'); // Sunday: still 4
  assert.deepEqual(client.calls, []);
  await sweep('2026-11-09T10:00:00Z'); // Monday 10:00: 5
  await sweep('2026-11-10T10:00:00Z');
  const reminders = comments(client, 1, MARKERS.overdue);
  assert.equal(reminders.length, 1);
  assert.match(reminders[0], /@accesswatch/);
  assert.ok(client.labels(1).includes(LABELS.overdue));
});

test('the sweep leaves old issues alone and heals a missed maintainer reply', async () => {
  const client = new FakeClient();
  client.addItem({ number: 1, labels: ['accessibility', LABELS.awaiting], created_at: '2026-09-01T00:00:00Z' });
  client.addItem({ number: 2, labels: ['accessibility', LABELS.awaiting], created_at: '2026-10-30T00:00:00Z' });
  client.say(2, MAINTAINER, 'On it', 'OWNER');
  await run(client, 'reports', { eventName: 'schedule', payload: {} }, new Date('2026-12-01T00:00:00Z'));
  assert.deepEqual(client.labels(1), ['a11y: awaiting response', 'accessibility']);
  assert.deepEqual(client.labels(2), ['accessibility']);
  assert.equal(client.bodies(1).length, 0);
});

// ---------------------------------------------------------------- close gate

const closed = (client, reason = 'completed', sender = MAINTAINER) => {
  const issue = client.items.get(1);
  issue.state = 'closed';
  issue.state_reason = reason;
  client.timelines.get(1).push({ event: 'closed', commit_id: null });
  return { eventName: 'issues', payload: { action: 'closed', issue, sender } };
};

test('closing a report without an outcome reopens it and explains once', async () => {
  const client = new FakeClient();
  report(client, { labels: ['accessibility', LABELS.awaiting] });
  await run(client, 'reports', closed(client));
  await run(client, 'reports', closed(client));
  assert.equal(client.items.get(1).state, 'open');
  assert.equal(client.calls.filter((c) => c[0] === 'reopen').length, 2);
  const gate = comments(client, 1, MARKERS.outcomeNeeded);
  assert.equal(gate.length, 1);
  assert.match(gate[0], /starts with `Outcome:`/);
  assert.match(gate[0], /Fixes #1/);
});

test('an Outcome line before the reporter last spoke does not count', async () => {
  const client = new FakeClient();
  report(client);
  client.say(1, MAINTAINER, 'Outcome: fixed in 1.2', 'MEMBER', '2026-11-03T10:00:00Z');
  client.say(1, REPORTER, 'Still broken for me', 'NONE', '2026-11-04T10:00:00Z');
  await run(client, 'reports', closed(client));
  assert.equal(client.items.get(1).state, 'open');
  client.say(1, MAINTAINER, 'Thanks.\n\n**Outcome:** the real fix shipped in 1.3.', 'MEMBER', '2026-11-05T10:00:00Z');
  await run(client, 'reports', closed(client));
  assert.equal(client.items.get(1).state, 'closed');
});

test('a non-maintainer Outcome line does not count', async () => {
  const client = new FakeClient();
  report(client);
  client.say(1, STRANGER, 'Outcome: works now', 'CONTRIBUTOR');
  await run(client, 'reports', closed(client));
  assert.equal(client.items.get(1).state, 'open');
});

test('a close by commit counts as an outcome and invites validation once', async () => {
  const client = new FakeClient();
  report(client, { labels: ['accessibility', LABELS.awaiting] });
  const event = closed(client);
  client.timelines.get(1).at(-1).commit_id = 'abcdef1234567';
  await run(client, 'reports', event);
  await run(client, 'reports', event);
  assert.equal(client.items.get(1).state, 'closed');
  const invites = comments(client, 1, MARKERS.validation);
  assert.equal(invites.length, 1);
  assert.match(invites[0], /@reporter/);
  assert.match(invites[0], /Replying here reopens the conversation/);
  assert.deepEqual(client.labels(1), ['a11y: validation requested', 'accessibility']);
});

test('a cross-referenced merged pull request counts as an outcome', async () => {
  const client = new FakeClient();
  report(client);
  client.timelines.get(1).push({ event: 'cross-referenced', source: { issue: { number: 7, pull_request: { merged_at: '2026-11-03T00:00:00Z' } } } });
  await run(client, 'reports', closed(client));
  assert.equal(client.items.get(1).state, 'closed');
  assert.equal(comments(client, 1, MARKERS.validation).length, 1);
});

test('closed as not planned or duplicate needs the outcome but gets no validation invite', async () => {
  for (const reason of ['not_planned', 'duplicate']) {
    const client = new FakeClient();
    report(client);
    await run(client, 'reports', closed(client, reason));
    assert.equal(client.items.get(1).state, 'open', reason);
    client.say(1, MAINTAINER, 'Outcome: duplicate of #2, tracked there.', 'OWNER', '2026-11-03T00:00:00Z');
    await run(client, 'reports', closed(client, reason));
    assert.equal(client.items.get(1).state, 'closed', reason);
    assert.equal(comments(client, 1, MARKERS.validation).length, 0, reason);
  }
});

test('events from a bot are skipped, so the gate never loops', async () => {
  const client = new FakeClient();
  report(client);
  const log = await run(client, 'reports', closed(client, 'completed', BOT));
  assert.deepEqual(client.calls, []);
  assert.match(log[0], /skipped/);
  await run(client, 'reports', { eventName: 'issues', payload: { action: 'opened', issue: client.items.get(1), sender: BOT } });
  assert.deepEqual(client.calls, []);
});

// ---------------------------------------------------------------- credit ask

const merged = (client, number, extra = {}) => {
  const pull = client.addItem({ number, pull_request: {}, merged: true, user: STRANGER, author_association: 'CONTRIBUTOR', ...extra });
  return { eventName: 'pull_request_target', payload: { action: 'closed', pull_request: pull, sender: MAINTAINER } };
};

test('a merged accessibility pull request from a contributor is asked once', async () => {
  const client = new FakeClient();
  const event = merged(client, 5, { labels: ['accessibility'] });
  await run(client, 'credits', event);
  await run(client, 'credits', event);
  const asks = comments(client, 5, MARKERS.creditAsk);
  assert.equal(asks.length, 1);
  assert.match(asks[0], /`credit: @stranger`/);
  assert.match(asks[0], /`credit: name <Name>`/);
  assert.match(asks[0], /`credit: anonymous`/);
  assert.match(asks[0], /`credit: no`/);
  assert.match(asks[0], /nothing about you beyond the credit you choose/);
  assert.doesNotMatch(asks[0], /disabilit|diagnos|screen reader/i);
  assert.ok(client.labels(5).includes(LABELS.asked));
});

test('a merged pull request that closes an accessibility issue is asked', async () => {
  const client = new FakeClient();
  client.addItem({ number: 2, labels: ['accessibility'] });
  await run(client, 'credits', merged(client, 6, { body: 'This change\n\nFixes #2' }));
  assert.equal(comments(client, 6, MARKERS.creditAsk).length, 1);
  await run(client, 'credits', merged(client, 7, { body: 'Fixes other/repo#2' }));
  await run(client, 'credits', merged(client, 8, { body: 'Mentions #2 only' }));
  assert.equal(client.bodies(7).length + client.bodies(8).length, 0);
});

test('maintainer, bot and unmerged pull requests are not asked', async () => {
  const client = new FakeClient();
  await run(client, 'credits', merged(client, 5, { labels: ['accessibility'], author_association: 'OWNER', user: MAINTAINER }));
  await run(client, 'credits', merged(client, 6, { labels: ['accessibility'], user: { login: 'dependabot[bot]', type: 'Bot' } }));
  await run(client, 'credits', merged(client, 7, { labels: ['accessibility'], merged: false }));
  assert.deepEqual(client.calls, []);
});

test('a report closed as completed with an outcome asks the reporter; not planned does not', async () => {
  const client = new FakeClient();
  report(client);
  client.say(1, MAINTAINER, 'Outcome: fixed in 2.0', 'MEMBER', '2026-11-03T00:00:00Z');
  await run(client, 'credits', closed(client, 'not_planned'));
  assert.equal(comments(client, 1, MARKERS.creditAsk).length, 0);
  await run(client, 'credits', closed(client, 'completed'));
  await run(client, 'credits', closed(client, 'completed'));
  const asks = comments(client, 1, MARKERS.creditAsk);
  assert.equal(asks.length, 1);
  assert.match(asks[0], /@reporter/);
});

test('a report closed without an outcome is not asked yet', async () => {
  const client = new FakeClient();
  report(client);
  await run(client, 'credits', closed(client));
  assert.equal(client.bodies(1).length, 0);
});

// ---------------------------------------------------------------- credit replies

async function askedReport() {
  const client = new FakeClient();
  report(client, { state: 'closed', state_reason: 'completed', closed_at: '2026-11-03T00:00:00Z' });
  client.say(1, MAINTAINER, 'Outcome: fixed', 'MEMBER', '2026-11-03T00:00:00Z');
  client.timelines.get(1).push({ event: 'closed', commit_id: null });
  await run(client, 'credits', { eventName: 'issues', payload: { action: 'closed', issue: client.items.get(1), sender: MAINTAINER } });
  return client;
}
const reply = (client, user, body, association = 'NONE') => {
  client.say(1, user, body, association);
  return run(client, 'credits', { eventName: 'issue_comment', payload: { action: 'created', issue: client.items.get(1), sender: user } });
};
const confirmations = (client) => client.bodies(1).filter((b) => b.startsWith('<!-- a11y-credit: choice='));

test('parseCreditReply reads each form and ignores quotes', () => {
  assert.deepEqual(parseCreditReply('credit: @octo-cat'), { choice: 'handle', handle: 'octo-cat' });
  assert.deepEqual(parseCreditReply('Sure!\n`credit: name <Sam Lee>`'), { choice: 'name', name: 'Sam Lee' });
  assert.deepEqual(parseCreditReply('credit: name Ana "Bee" <x> -- y'), { choice: 'name', name: 'Ana Bee x - y' });
  assert.deepEqual(parseCreditReply('Credit: Anonymous.'), { choice: 'anonymous' });
  assert.deepEqual(parseCreditReply('credit: no'), { choice: 'no' });
  assert.equal(parseCreditReply('> credit: no'), null);
  assert.equal(parseCreditReply('credit: maybe'), null);
  assert.equal(parseCreditReply('no credit please'), null);
});

test('credit: @handle records credit: yes and confirms', async () => {
  const client = await askedReport();
  await reply(client, REPORTER, 'credit: @reporter');
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: yes']);
  const [confirmation] = confirmations(client);
  assert.match(confirmation, /choice="handle" handle="reporter"/);
  assert.match(confirmation, /credit you as @reporter/);
});

test('credit: name stores the name only in the confirmation line', async () => {
  const client = await askedReport();
  await reply(client, REPORTER, 'credit: name <Sam Lee>');
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: yes']);
  const [confirmation] = confirmations(client);
  assert.match(confirmation, /^<!-- a11y-credit: choice="name" name="Sam Lee" reply="\d+" -->/);
  assert.match(confirmation, /credit you as Sam Lee/);
});

test('credit: anonymous and credit: no record their labels', async () => {
  let client = await askedReport();
  await reply(client, REPORTER, 'credit: anonymous');
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: anonymous']);
  client = await askedReport();
  await reply(client, REPORTER, 'credit: no');
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: no']);
  assert.match(confirmations(client)[0], /will not name you/);
});

test('a reply from anyone but the contributor is ignored, even a maintainer', async () => {
  const client = await askedReport();
  const before = client.calls.length;
  await reply(client, STRANGER, 'credit: @stranger');
  await reply(client, MAINTAINER, 'credit: no', 'OWNER');
  assert.equal(client.calls.length, before);
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: asked']);
});

test('the same reply is confirmed once, and a later reply changes the choice', async () => {
  const client = await askedReport();
  await reply(client, REPORTER, 'credit: @reporter');
  await reply(client, STRANGER, 'nice');
  assert.equal(confirmations(client).length, 1);
  await reply(client, REPORTER, 'Actually, credit: no');
  assert.equal(confirmations(client).length, 1, 'credit: must start the line');
  await reply(client, REPORTER, 'Actually:\ncredit: no');
  assert.equal(confirmations(client).length, 2);
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: no']);
});

test('a forged confirmation line from a person is not trusted', async () => {
  const client = await askedReport();
  client.say(1, STRANGER, '<!-- a11y-credit: choice="name" name="Forged" reply="1" -->');
  await reply(client, REPORTER, 'credit: anonymous');
  assert.deepEqual(client.labels(1), ['accessibility', 'credit: anonymous']);
});

// ---------------------------------------------------------------- list

test('closingReferences keeps same-repository closing keywords only', () => {
  assert.deepEqual(closingReferences('Fixes #3, closes example/example#4, resolves other/x#5, see #6', 'example/example'), [3, 4]);
});

test('the credits list groups code and other work and warns about old questions', async () => {
  const client = new FakeClient();
  const add = (number, label, extra = {}) => client.addItem({ number, labels: [label], state: 'closed', closed_at: '2026-11-10T00:00:00Z', title: `Work ${number}`, ...extra });
  add(10, LABELS.yes, { pull_request: {}, user: STRANGER, title: 'Label the *search* field' });
  client.say(10, BOT, '<!-- a11y-credit: choice="handle" handle="stranger" reply="1" -->\nThanks');
  add(11, LABELS.yes);
  client.say(11, BOT, '<!-- a11y-credit: choice="name" name="Sam Lee" reply="2" -->\nThanks');
  add(12, LABELS.anonymous, { pull_request: {} });
  add(13, LABELS.yes, { closed_at: '2026-10-01T00:00:00Z' });
  add(14, LABELS.no);
  add(15, LABELS.asked, { title: 'Old question' });
  client.say(15, BOT, `${MARKERS.creditAsk}\nHow?`, 'NONE', '2026-11-01T00:00:00Z');
  add(16, LABELS.asked);
  client.say(16, BOT, `${MARKERS.creditAsk}\nHow?`, 'NONE', '2026-11-20T00:00:00Z');

  const since = await resolveSince(client, 'v1.0.0');
  assert.equal(since.toISOString(), '2026-11-01T00:00:00.000Z');
  assert.equal((await resolveSince(client, '2026-11-01')).toISOString(), '2026-11-01T00:00:00.000Z');
  const result = await collectCredits(client, config, since, new Date('2026-11-25T00:00:00Z'));
  const block = formatCredits(result, config);
  assert.equal(block, [
    '### Accessibility contributions',
    '',
    'Thank you to everyone who helped make Example more accessible in this release.',
    '',
    'Code contributions:',
    '',
    '- Label the \\*search\\* field (#10), by @stranger',
    '- Work 12 (#12), by an anonymous contributor',
    '',
    'Reports, testing, reviews and other contributions:',
    '',
    '- Work 11 (#11), by Sam Lee',
    '',
  ].join('\n'));
  const warnings = formatWarnings(result, config);
  assert.match(warnings, /1 credit question\(s\) unanswered for more than 14 days/);
  assert.match(warnings, /#15 Old question \(asked 2026-11-01\)/);
  assert.doesNotMatch(warnings, /#16/);
  assert.equal(formatCredits({ credits: [] }, config), '');
});

test('makeClient maps calls to REST routes and tolerates a missing label', async () => {
  const seen = [];
  const client = makeClient({
    request: async (route, params) => {
      seen.push(route);
      if (route.startsWith('DELETE')) { const e = new Error('gone'); e.status = 404; throw e; }
      if (route.includes('/commits/')) return { commit: { committer: { date: '2026-11-01T00:00:00Z' } } };
      return {};
    },
    paginate: async (route) => { seen.push(route); return []; },
  }, { owner: 'o', repo: 'r' });
  await client.removeLabel(1, 'x');
  await client.reopen(1);
  assert.equal(await client.refDate('v1'), '2026-11-01T00:00:00Z');
  await client.listTimeline(1);
  assert.deepEqual(seen, [
    'DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}',
    'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
    'GET /repos/{owner}/{repo}/commits/{ref}',
    'GET /repos/{owner}/{repo}/issues/{issue_number}/timeline',
  ]);
});
