import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  LIMITS,
  absoluteLinks,
  buildManifest,
  checkArchive,
  checkEntryNames,
  checkImage,
  checkManifest,
  contrast,
  packagePlugin,
  readZipNames,
  writeZip,
} from './package-openai-plugin.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- fixtures

/** A PNG header only: signature plus IHDR. The checks read nothing else. */
function png(width, height, pad = 0) {
  const buf = Buffer.alloc(33 + pad);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write('IHDR', 12, 'latin1');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

const SKILL = (name, description = 'Reviews one thing.') =>
  `---\nname: ${name}\ndescription: ${description}\nmetadata:\n  tier: router\n---\nBody.\n`;

const YAML = [
  '# Codex interface for this skill.',
  'interface:',
  '  display_name: "Demo"',
  '  short_description: "A demo skill"',
  'policy:',
  '  allow_implicit_invocation: true',
  '',
].join('\n');

/** A minimal checkout that packages cleanly; `change` breaks one thing. */
function fixture(t, change = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-openai-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (rel, data) => {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, data);
  };
  put('plugin.json', JSON.stringify({ name: 'accessibility-agents', version: '0.0.1', license: 'MIT' }));
  put('package.json', JSON.stringify({ name: 'accessibility-agents', version: '0.0.1' }));
  for (const f of ['LICENSE', 'PRIVACY.md', 'README.md']) put(f, `${f}\n`);
  put('.claude-plugin/icon.png', png(64, 64));
  put('skills/demo/SKILL.md', SKILL('demo'));
  put('skills/demo/agents/openai.yaml', YAML);
  put('skills/demo/references/notes.md', 'Notes.\n');
  change({ root, put });
  return root;
}

/** Package a fixture without writing, and return its errors. */
function errorsFor(t, change) {
  const root = fixture(t, change);
  return packagePlugin({ root, write: false }).errors;
}

function assertFails(errors, file, pattern) {
  assert.ok(
    errors.some((e) => e.startsWith(file) && pattern.test(e)),
    `expected an error naming ${file} matching ${pattern}; got:\n  ${errors.join('\n  ') || '(none)'}`,
  );
}

/** The real listing, for the manifest checks to mutate. */
function manifest(change = (ui) => ui) {
  const m = buildManifest({ name: 'accessibility-agents', version: '0.0.1' }, { skills: 113, routers: 6 });
  change(m.extensions['com.openai.interface'], m);
  return m;
}

/** Inflate one entry back out of a ZIP, reading its central directory. */
function extract(buffer, wanted) {
  const eocd = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let at = buffer.readUInt32LE(eocd + 16);
  for (let i = 0; i < buffer.readUInt16LE(eocd + 10); i += 1) {
    const method = buffer.readUInt16LE(at + 10);
    const size = buffer.readUInt32LE(at + 20);
    const nameLen = buffer.readUInt16LE(at + 28);
    const local = buffer.readUInt32LE(at + 42);
    const name = buffer.toString('utf8', at + 46, at + 46 + nameLen);
    if (name === wanted) {
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const body = buffer.subarray(start, start + size);
      return method === 8 ? zlib.inflateRawSync(body) : body;
    }
    at += 46 + nameLen + buffer.readUInt16LE(at + 30) + buffer.readUInt16LE(at + 32);
  }
  return null;
}

// -------------------------------------------------------------- the repo

test('the real repository packages cleanly, with exactly what the plan names', (t) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-openai-out-'));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  const result = packagePlugin({ root: REPO, outDir: out });
  assert.deepEqual(result.errors, []);
  assert.ok(fs.existsSync(result.file));

  const zip = fs.readFileSync(result.file);
  const names = readZipNames(zip);
  const skillFiles = [];
  const walk = (abs) => {
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const full = path.join(abs, e.name);
      if (e.isDirectory()) walk(full);
      else skillFiles.push(path.relative(REPO, full).split(path.sep).join('/'));
    }
  };
  walk(path.join(REPO, 'skills'));
  assert.deepEqual(
    [...names].sort(),
    ['plugin.json', 'LICENSE', 'PRIVACY.md', 'README.md', 'assets/logo.png', 'assets/icon.png', ...skillFiles].sort(),
  );

  for (const left of ['hooks', 'mcp.json', '.mcp.json', 'mcp-server', '.claude-plugin', '.codex-plugin', 'com.github.copilot',
    'scripts', 'docs', '.github', '.devcontainer', '.vscode', 'templates', 'example', 'action', 'node_modules',
    'manifest.json', 'server.json', 'budgets.json', 'AGENTS.md', 'CLAUDE.md', '.claude']) {
    assert.ok(!names.some((n) => n === left || n.startsWith(`${left}/`)), `${left} must be left out`);
  }

  const generated = JSON.parse(extract(zip, 'plugin.json').toString('utf8'));
  const own = JSON.parse(fs.readFileSync(path.join(REPO, 'plugin.json'), 'utf8'));
  assert.equal(generated.name, own.name);
  assert.equal(generated.version, own.version);
  assert.deepEqual(generated.author, { name: 'Jeff Bishop', url: 'https://github.com/accesswatch' });
  assert.match(generated.description, /no hooks, no edit gate and no scanners/);
  assert.equal(generated.extensions['com.openai.interface'].displayName, 'Accessibility Agents');
  assert.deepEqual(extract(zip, 'skills/a11y-core/SKILL.md'), fs.readFileSync(path.join(REPO, 'skills/a11y-core/SKILL.md')));
  assert.deepEqual(extract(zip, 'assets/logo.png'), fs.readFileSync(path.join(REPO, '.claude-plugin/icon.png')));
  const readme = extract(zip, 'README.md').toString('utf8');
  assert.doesNotMatch(readme, /\]\((?!https?:|mailto:|#)/, 'README links into left-out folders must be absolute');
});

test('relative links become repository links; anchors and URLs stay', () => {
  assert.equal(
    absoluteLinks('[a](docs/x.md) [b](./mcp-server/) [c](#top) [d](https://e.org)', 'https://github.com/o/r'),
    '[a](https://github.com/o/r/blob/main/docs/x.md) [b](https://github.com/o/r/tree/main/mcp-server/) [c](#top) [d](https://e.org)',
  );
});

test('the repository plugin.json is not what ships', () => {
  const own = JSON.parse(fs.readFileSync(path.join(REPO, 'plugin.json'), 'utf8'));
  assert.equal(own.extensions, undefined, 'the listing lives in the package script, not in the shared manifest');
});

test('a fixture packages cleanly, and the ZIP reads back', (t) => {
  const root = fixture(t);
  const result = packagePlugin({ root });
  assert.deepEqual(result.errors, []);
  assert.equal(path.basename(result.file), 'accessibility-agents-openai-0.0.1.zip');
  const zip = fs.readFileSync(result.file);
  assert.equal(extract(zip, 'skills/demo/SKILL.md').toString('utf8'), SKILL('demo'));
  assert.equal(extract(zip, 'README.md').toString('utf8'), 'README.md\n');
});

test('a failing check writes nothing', (t) => {
  const root = fixture(t, ({ put }) => put('skills/loose.md', 'x'));
  const result = packagePlugin({ root });
  assert.notDeepEqual(result.errors, []);
  assert.equal(fs.existsSync(path.join(root, 'dist')), false);
});

// ---------------------------------------------------------------- skills

test('a skill without a name fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('skills/demo/SKILL.md', SKILL(''))), 'skills/demo/SKILL.md', /name is missing/);
});

test('a skill without a description fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('skills/demo/SKILL.md', SKILL('demo', ''))), 'skills/demo/SKILL.md', /description is missing/);
});

test('a description over 1,024 characters fails', (t) => {
  const errors = errorsFor(t, ({ put }) => put('skills/demo/SKILL.md', SKILL('demo', 'x'.repeat(LIMITS.skillDescription + 1))));
  assertFails(errors, 'skills/demo/SKILL.md', /1025 characters/);
});

test('a plugin:skill name over 64 characters fails', (t) => {
  const long = 'a'.repeat(64 - 'accessibility-agents:'.length + 1);
  const errors = errorsFor(t, ({ put }) => {
    put(`skills/${long}/SKILL.md`, SKILL(long));
    put(`skills/${long}/agents/openai.yaml`, YAML);
  });
  assertFails(errors, `skills/${long}/SKILL.md`, /65 characters; the limit is 64/);
});

test('two skills with one name fail', (t) => {
  const errors = errorsFor(t, ({ put }) => {
    put('skills/demo-two/SKILL.md', SKILL('demo'));
    put('skills/demo-two/agents/openai.yaml', YAML);
  });
  assertFails(errors, 'skills/demo-two/SKILL.md', /name demo is also used by skills\/demo$/);
});

test('a skill folder starting with a dot fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('skills/.hidden/SKILL.md', SKILL('hidden'))), 'skills/.hidden', /may not start with a dot/);
});

test('a loose file under skills/ fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('skills/notes.md', 'x')), 'skills/notes.md', /directly under skills/);
});

// ------------------------------------------------------------ openai.yaml

test('openai.yaml without interface.display_name fails', (t) => {
  const errors = errorsFor(t, ({ put }) => put('skills/demo/agents/openai.yaml', YAML.replace(/ {2}display_name.*\n/, '')));
  assertFails(errors, 'skills/demo/agents/openai.yaml', /display_name is missing/);
});

test('openai.yaml without interface.short_description fails', (t) => {
  const errors = errorsFor(t, ({ put }) => put('skills/demo/agents/openai.yaml', YAML.replace(/ {2}short_description.*\n/, '')));
  assertFails(errors, 'skills/demo/agents/openai.yaml', /short_description is missing/);
});

test('openai.yaml with a policy key OpenAI does not read fails', (t) => {
  const errors = errorsFor(t, ({ put }) => put('skills/demo/agents/openai.yaml', `${YAML}  surprise: true\n`));
  assertFails(errors, 'skills/demo/agents/openai.yaml', /policy holds surprise/);
});

test('openai.yaml policy may hold products as a list', (t) => {
  const errors = errorsFor(t, ({ put }) => put('skills/demo/agents/openai.yaml', `${YAML}  products:\n    - chatgpt\n`));
  assert.deepEqual(errors, []);
});

test('openai.yaml with screenshots fails', (t) => {
  const errors = errorsFor(t, ({ put }) =>
    put('skills/demo/agents/openai.yaml', YAML.replace('interface:\n', 'interface:\n  screenshots:\n    - a.png\n')));
  assertFails(errors, 'skills/demo/agents/openai.yaml', /screenshots is set/);
});

test('a missing openai.yaml fails', (t) => {
  const errors = errorsFor(t, ({ root }) => fs.rmSync(path.join(root, 'skills/demo/agents'), { recursive: true }));
  assertFails(errors, 'skills/demo/agents/openai.yaml', /is missing/);
});

// ------------------------------------------------------ forbidden content

for (const name of ['hooks/guard.mjs', 'mcp.json', '.mcp.json', '.app.json', 'skills/demo/hooks/x.json', 'skills/demo/.mcp.json']) {
  test(`${name} in the archive fails`, () => {
    assertFails(checkEntryNames(['plugin.json', name], manifest()), name, /may not be in a skills-only package/);
  });
}

test('a skill folder holding hooks fails the real build', (t) => {
  const errors = errorsFor(t, ({ put }) => put('skills/demo/hooks/hooks.json', '{}'));
  assertFails(errors, 'skills/demo/hooks/hooks.json', /may not be in a skills-only package/);
});

test('interface.screenshots in the manifest fails', () => {
  assertFails(checkManifest(manifest((ui) => { ui.screenshots = ['./a.png']; })), 'plugin.json', /screenshots is set/);
});

test('a logo the archive does not hold fails', () => {
  const errors = checkEntryNames(['plugin.json', 'assets/icon.png'], manifest());
  assertFails(errors, 'plugin.json', /interface.logo points at .\/assets\/logo.png/);
});

// ----------------------------------------------------------------- images

test('a non-square image fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('.claude-plugin/icon.png', png(64, 48))), '.claude-plugin/icon.png', /must be square/);
});

test('an image under 48 pixels fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('.claude-plugin/icon.png', png(32, 32))), '.claude-plugin/icon.png', /32 pixels is outside/);
});

test('an image over 4,096 pixels fails', () => {
  assertFails(checkImage('logo.png', png(5000, 5000)), 'logo.png', /5000 pixels is outside/);
});

test('an image of 5 MiB or more fails', () => {
  assertFails(checkImage('logo.png', png(512, 512, LIMITS.imageBytes)), 'logo.png', /under 5 MiB/);
});

test('a file that is not a PNG fails', (t) => {
  assertFails(errorsFor(t, ({ put }) => put('.claude-plugin/icon.png', 'GIF89a')), '.claude-plugin/icon.png', /is not a PNG/);
});

test('the shipped icon passes', () => {
  assert.deepEqual(checkImage('icon.png', fs.readFileSync(path.join(REPO, '.claude-plugin/icon.png'))), []);
});

// ---------------------------------------------------------------- listing

test('the listing as decided passes', () => {
  assert.deepEqual(checkManifest(manifest()), []);
});

const tooLong = [
  ['displayName', LIMITS.displayName],
  ['shortDescription', LIMITS.shortDescription],
  ['longDescription', LIMITS.longDescription],
  ['developerName', LIMITS.developerName],
];
for (const [key, max] of tooLong) {
  test(`interface.${key} over ${max} characters fails`, () => {
    const errors = checkManifest(manifest((ui) => { ui[key] = 'x'.repeat(max + 1); }));
    assertFails(errors, 'plugin.json', new RegExp(`interface.${key} is ${max + 1} characters`));
  });
}

test('a manifest description over 1,024 characters fails', () => {
  const errors = checkManifest(manifest((ui, m) => { m.description = 'x'.repeat(1025); }));
  assertFails(errors, 'plugin.json', /description is 1025 characters/);
});

test('more than three starter prompts fail', () => {
  const errors = checkManifest(manifest((ui) => { ui.defaultPrompt = ['a', 'b', 'c', 'd']; }));
  assertFails(errors, 'plugin.json', /defaultPrompt has 4 entries/);
});

test('a starter prompt over 128 characters fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.defaultPrompt = ['x'.repeat(129)]; }));
  assertFails(errors, 'plugin.json', /defaultPrompt\[0\] is 129 characters/);
});

test('a starter prompt with an @ mention fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.defaultPrompt = ['Ask @accessibility-agents to review this']; }));
  assertFails(errors, 'plugin.json', /contains "@"/);
});

test('a category outside OpenAI\'s list fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.category = 'Accessibility'; }));
  assertFails(errors, 'plugin.json', /category "Accessibility" is not one of/);
});

test('a brand colour that is not six-digit hex fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.brandColor = '#2E7'; }));
  assertFails(errors, 'plugin.json', /not a six-digit hex/);
});

test('a brand colour under 2:1 against white fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.brandColor = '#FFFF66'; }));
  assertFails(errors, 'plugin.json', /against #FFFFFF/);
});

test('a brand colour under 2:1 against #212121 fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.brandColor = '#000000'; }));
  assertFails(errors, 'plugin.json', /against #212121/);
});

test('the decided brand colour clears both contrast floors', () => {
  assert.ok(contrast('#2E7D32', '#FFFFFF') > 5);
  assert.ok(contrast('#2E7D32', '#212121') > 3);
});

test('a URL that is not HTTPS fails', () => {
  const errors = checkManifest(manifest((ui) => { ui.supportURL = 'http://example.org/issues'; }));
  assertFails(errors, 'plugin.json', /supportURL is http:\/\/example.org\/issues; every URL must be HTTPS/);
});

test('a missing privacy policy URL fails', () => {
  const errors = checkManifest(manifest((ui) => { delete ui.privacyPolicyURL; }));
  assertFails(errors, 'plugin.json', /privacyPolicyURL is missing/);
});

// ---------------------------------------------------------------- archive

const tiny = (name) => ({ name, data: Buffer.from('x') });

test('an archive of 5,000 entries or more fails', () => {
  const zip = writeZip(Array.from({ length: LIMITS.archiveEntries }, (_, i) => tiny(`skills/s/${i}.md`)));
  assertFails(checkArchive(zip), 'archive', /5000 entries/);
});

test('an archive of 100 MB or more fails', () => {
  const zip = writeZip([tiny('plugin.json')]);
  const padded = Buffer.concat([Buffer.alloc(LIMITS.archiveBytes), zip]);
  assertFails(checkArchive(padded), 'archive', /the limit is under 100 MB/);
});

test('an archive path with a backslash fails', () => {
  const name = 'skills\\demo\\SKILL.md';
  assertFails(checkArchive(writeZip([tiny(name)])), name, /use \/ only/);
  assertFails(checkEntryNames(['plugin.json', name], manifest()), name, /use \/ only/);
});

test('an archive path with .. fails', () => {
  const name = 'skills/../escape.md';
  assertFails(checkArchive(writeZip([tiny(name)])), name, /no \.\./);
  assertFails(checkEntryNames(['plugin.json', name], manifest()), name, /\. or \.\. segments/);
});

test('an absolute archive path fails', () => {
  assertFails(checkEntryNames(['plugin.json', '/etc/passwd'], manifest()), '/etc/passwd', /must be relative/);
});

test('a second plugin root fails', () => {
  const errors = checkEntryNames(['plugin.json', 'other/plugin.json'], manifest());
  assertFails(errors, 'other/plugin.json', /only skills\/ and assets\/ may hold folders/);
});
