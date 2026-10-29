#!/usr/bin/env node
/**
 * package-openai-plugin.mjs - build the skills-only package for OpenAI's
 * plugin directory, the one shared by ChatGPT and Codex.
 *
 * The directory takes a ZIP with one plugin root. OpenAI's guide for this exact
 * case ("Submit your Claude Code plugin to OpenAI") says to keep a root
 * plugin.json, remove hooks before public submission, and leave MCP
 * configuration out of a skills-only upload. So the archive holds the skills,
 * a generated plugin.json with the listing fields, two images, and the three
 * files a reader needs (LICENSE, and PRIVACY.md and README.md with their
 * relative links pointed at the repository). Nothing that would
 * claim a scanner or an edit gate the plugin cannot have in ChatGPT goes in.
 *
 * The repository's own plugin.json is never changed: the other clients read
 * it. The listing fields live here, in one place, so a validation finding from
 * the portal is fixed in this file and rebuilt, never edited by hand in a ZIP.
 *
 * Every limit is checked before anything is written, and each failure names
 * the file it is about. Node built-ins only: zlib deflates, and a small writer
 * below lays out the ZIP.
 *
 * Usage:
 *   npm run package:openai
 *   node scripts/package-openai-plugin.mjs --check          check only, write nothing
 *   node scripts/package-openai-plugin.mjs --out <dir>      write the ZIP somewhere else
 *   node scripts/package-openai-plugin.mjs --root <dir>     package another checkout
 *   node scripts/package-openai-plugin.mjs --print-manifest print the generated plugin.json
 *
 * Exit code 0 when the package is valid (and written), 1 when any check fails.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');

// ------------------------------------------------------------------ limits

/** OpenAI's published limits, in one place so a change is one edit. */
export const LIMITS = {
  pluginSkillName: 64, // `<plugin>:<skill>`
  skillDescription: 1024,
  manifestDescription: 1024,
  displayName: 30,
  shortDescription: 30,
  longDescription: 4000,
  developerName: 80,
  defaultPrompts: 3,
  defaultPromptLength: 128,
  imageMinPx: 48,
  imageMaxPx: 4096,
  imageBytes: 5 * 1024 * 1024,
  archiveBytes: 100 * 1000 * 1000,
  archiveEntries: 5000,
  brandContrast: 2,
};

/** OpenAI's directory categories. */
export const CATEGORIES = [
  'Productivity',
  'Creativity',
  'Developer Tools',
  'Business & Operations',
  'Data & Analytics',
  'Communication',
  'Education & Research',
  'Security',
  'Finance',
  'Healthcare',
  'Travel',
  'Entertainment',
  'Other',
];

/** The only keys OpenAI reads under `policy` in a skill's agents/openai.yaml. */
const POLICY_KEYS = new Set(['products', 'allow_implicit_invocation']);

/** Files that must never reach a skills-only package. */
const FORBIDDEN_BASENAMES = new Set(['mcp.json', '.mcp.json', '.app.json']);
const FORBIDDEN_SEGMENTS = new Set(['hooks', '.claude-plugin', '.codex-plugin', 'mcp-server']);

/** Root files copied as they are. */
const ROOT_FILES = ['LICENSE', 'PRIVACY.md', 'README.md'];

/** The source image, copied twice: the listing logo and the composer icon. */
const ICON_SOURCE = '.claude-plugin/icon.png';
const IMAGES = { 'assets/logo.png': ICON_SOURCE, 'assets/icon.png': ICON_SOURCE };

// ----------------------------------------------------------------- listing

/**
 * The listing, as decided on 29 October 2026. Counts are measured from the
 * skills folder rather than typed, so the text cannot go stale.
 */
export function buildManifest(base, counts) {
  const { skills, routers } = counts;
  const routerWord = NUMBER_WORDS[routers] || String(routers);
  return {
    ...base,
    description:
      `WCAG 2.2 AA reviews of web pages, Office and PDF documents, markdown and desktop apps, as ${skills} Agent Skills. ` +
      `${capitalise(routerWord)} entry points route a task to the right specialist, and every finding cites the WCAG 2.2 success criterion it fails. ` +
      'This package is skills only: it has no hooks, no edit gate and no scanners. It works from the checker results and document text you give it, and never claims to have scanned anything.',
    author: { name: 'Jeff Bishop', url: 'https://github.com/accesswatch' },
    extensions: {
      'com.openai.interface': {
        displayName: 'Accessibility Agents',
        shortDescription: 'Cited WCAG 2.2 reviews',
        longDescription: [
          'Accessibility Agents is an open-source project from the Community Access community, maintained by Jeff Bishop.',
          '',
          `It is ${skills} skills for reviewing web pages, Word, Excel, PowerPoint and PDF documents, markdown and desktop apps against WCAG 2.2 AA. ` +
            `Start with one of the ${routerWord} entry points: accessibility-lead, web-accessibility-wizard, document-accessibility-wizard, markdown-a11y-assistant, developer-hub or github-hub. ` +
            'Each one sends the task to the specialists it needs.',
          '',
          'Every finding cites the WCAG 2.2 success criterion it fails, with the evidence it is based on.',
          '',
          'It works from what you give it: the results from your accessibility checker, the text of your document, or the code you paste. ' +
            'It never claims to have scanned anything. When a skill would need a scanner, it asks for your checker\'s results instead.',
          '',
          'The scanners, the review hooks and the edit gate belong to the full install on a laptop, through Claude Code, Codex, Copilot or Gemini, and are not part of this plugin.',
        ].join('\n'),
        developerName: 'Jeff Bishop',
        category: 'Education & Research',
        capabilities: ['Interactive', 'Read'],
        websiteURL: 'https://github.com/Community-Access/accessibility-agents',
        supportURL: 'https://github.com/Community-Access/accessibility-agents/issues',
        privacyPolicyURL: 'https://github.com/Community-Access/accessibility-agents/blob/main/PRIVACY.md',
        defaultPrompt: [
          'Review this syllabus for accessibility barriers, using the checker results I paste.',
          'Which WCAG 2.2 criteria does this web page fail, from these axe results?',
          'Write an accessibility statement from these audit findings.',
        ],
        brandColor: '#4D8FE0',
        logo: './assets/logo.png',
        composerIcon: './assets/icon.png',
      },
    },
  };
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ------------------------------------------------------------------ parsing

/** Single-line frontmatter keys plus one level of nesting; enough for SKILL.md. */
export function parseFrontmatter(text) {
  const m = text.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  let parent = null;
  for (const line of m[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (top) {
      if (top[2].trim() === '') {
        parent = top[1];
        data[parent] = {};
      } else {
        parent = null;
        data[top[1]] = unquote(top[2].trim());
      }
      continue;
    }
    const sub = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (sub && parent) data[parent][sub[1]] = unquote(sub[2].trim());
  }
  return data;
}

/**
 * The shape agents/openai.yaml uses: top-level mappings, each holding scalar
 * keys or a list. Returns { key: { subkey: value | [items] } }.
 */
export function parseOpenaiYaml(text) {
  const out = {};
  let top = null;
  let sub = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '');
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const t = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (t) {
      top = t[1];
      sub = null;
      out[top] = t[2].trim() === '' ? {} : unquote(t[2].trim());
      continue;
    }
    const s = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (s && top && typeof out[top] === 'object') {
      sub = s[1];
      out[top][sub] = s[2].trim() === '' ? [] : unquote(s[2].trim());
      continue;
    }
    const item = line.match(/^\s+-\s*(.*)$/);
    if (item && top && sub && Array.isArray(out[top][sub])) out[top][sub].push(unquote(item[1].trim()));
  }
  return out;
}

function unquote(v) {
  if (v.length > 1 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) {
    try {
      return v[0] === '"' ? JSON.parse(v) : v.slice(1, -1);
    } catch {
      return v.slice(1, -1);
    }
  }
  return v;
}

// ------------------------------------------------------------------- images

/** Width, height and byte size of a PNG, read from its IHDR chunk. */
export function pngSize(buf) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(sig) || buf.toString('latin1', 12, 16) !== 'IHDR') {
    return null;
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
}

export function checkImage(where, buf) {
  const size = pngSize(buf);
  if (!size) return [`${where}: is not a PNG (no PNG signature and IHDR header)`];
  const errors = [];
  if (size.width !== size.height) errors.push(`${where}: is ${size.width} by ${size.height}; the image must be square`);
  for (const side of new Set([size.width, size.height])) {
    if (side < LIMITS.imageMinPx || side > LIMITS.imageMaxPx) {
      errors.push(`${where}: ${side} pixels is outside ${LIMITS.imageMinPx} to ${LIMITS.imageMaxPx}`);
    }
  }
  if (size.bytes >= LIMITS.imageBytes) errors.push(`${where}: ${size.bytes} bytes; the limit is under 5 MiB`);
  return errors;
}

// -------------------------------------------------------------------- color

/** WCAG relative luminance of a #RRGGBB colour. */
export function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------- manifest

/** Every listing limit, against the generated plugin.json. */
export function checkManifest(manifest, where = 'plugin.json (generated)') {
  const errors = [];
  const fail = (msg) => errors.push(`${where}: ${msg}`);
  const ui = manifest?.extensions?.['com.openai.interface'];
  if (!ui || typeof ui !== 'object') return [`${where}: has no extensions.com.openai.interface`];

  if (typeof manifest.description !== 'string' || !manifest.description.trim()) fail('description is empty');
  else if (manifest.description.length > LIMITS.manifestDescription) {
    fail(`description is ${manifest.description.length} characters; the limit is ${LIMITS.manifestDescription}`);
  }

  const text = [
    ['displayName', LIMITS.displayName],
    ['shortDescription', LIMITS.shortDescription],
    ['longDescription', LIMITS.longDescription],
    ['developerName', LIMITS.developerName],
  ];
  for (const [key, max] of text) {
    const v = ui[key];
    if (typeof v !== 'string' || !v.trim()) fail(`interface.${key} is missing`);
    else if (v.length > max) fail(`interface.${key} is ${v.length} characters; the limit is ${max}`);
  }

  const prompts = ui.defaultPrompt;
  if (prompts !== undefined) {
    if (!Array.isArray(prompts)) fail('interface.defaultPrompt must be a list');
    else {
      if (prompts.length > LIMITS.defaultPrompts) {
        fail(`interface.defaultPrompt has ${prompts.length} entries; the limit is ${LIMITS.defaultPrompts}`);
      }
      prompts.forEach((p, i) => {
        if (typeof p !== 'string' || !p.trim()) fail(`interface.defaultPrompt[${i}] is empty`);
        else {
          if (p.length > LIMITS.defaultPromptLength) {
            fail(`interface.defaultPrompt[${i}] is ${p.length} characters; the limit is ${LIMITS.defaultPromptLength}`);
          }
          if (p.includes('@')) fail(`interface.defaultPrompt[${i}] contains "@"; starter prompts may not mention`);
        }
      });
    }
  }

  if (!CATEGORIES.includes(ui.category)) {
    fail(`interface.category ${JSON.stringify(ui.category)} is not one of OpenAI's categories (${CATEGORIES.join(', ')})`);
  }

  if (typeof ui.brandColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(ui.brandColor)) {
    fail(`interface.brandColor ${JSON.stringify(ui.brandColor)} is not a six-digit hex colour such as #4D8FE0`);
  } else {
    for (const against of ['#FFFFFF', '#212121']) {
      const ratio = contrast(ui.brandColor, against);
      if (ratio < LIMITS.brandContrast) {
        fail(`interface.brandColor ${ui.brandColor} has ${ratio.toFixed(2)}:1 contrast against ${against}; at least 2:1 is required`);
      }
    }
  }

  if (ui.screenshots !== undefined) fail('interface.screenshots is set; a skills-only plugin carries none');

  for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL']) {
    if (typeof ui[key] !== 'string' || !ui[key]) fail(`interface.${key} is missing`);
  }
  for (const [key, value] of strings(manifest)) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !value.startsWith('https://')) {
      fail(`${key} is ${value}; every URL must be HTTPS`);
    }
  }
  return errors;
}

/** Every string in an object, with its dotted path. */
function* strings(value, at = '') {
  if (typeof value === 'string') yield [at, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${at}[${i}]`);
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) yield* strings(v, at ? `${at}.${k}` : k);
  }
}

// ------------------------------------------------------------------ skills

/** Every skill rule, against the source tree. Returns { errors, skills, routers }. */
export function checkSkills(root, pluginName) {
  const errors = [];
  const dir = path.join(root, 'skills');
  if (!fs.existsSync(dir)) return { errors: ['skills/: does not exist'], skills: 0, routers: 0 };

  const seen = new Map();
  let skills = 0;
  let routers = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = `skills/${entry.name}`;
    if (!entry.isDirectory()) {
      errors.push(`${rel}: is a file directly under skills/; only skill folders may live there`);
      continue;
    }
    if (entry.name.startsWith('.')) {
      errors.push(`${rel}: skill folders may not start with a dot`);
      continue;
    }
    skills += 1;

    const skillFile = path.join(dir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      errors.push(`${rel}/SKILL.md: is missing`);
      continue;
    }
    const fm = parseFrontmatter(fs.readFileSync(skillFile, 'utf8'));
    const name = typeof fm?.name === 'string' ? fm.name : '';
    const description = typeof fm?.description === 'string' ? fm.description : '';
    if (!name) errors.push(`${rel}/SKILL.md: name is missing or empty`);
    if (!description) errors.push(`${rel}/SKILL.md: description is missing or empty`);
    if (description.length > LIMITS.skillDescription) {
      errors.push(`${rel}/SKILL.md: description is ${description.length} characters; the limit is ${LIMITS.skillDescription}`);
    }
    if (name) {
      const full = `${pluginName}:${name}`;
      if (full.length > LIMITS.pluginSkillName) {
        errors.push(`${rel}/SKILL.md: ${full} is ${full.length} characters; the limit is ${LIMITS.pluginSkillName}`);
      }
      if (seen.has(name)) errors.push(`${rel}/SKILL.md: name ${name} is also used by ${seen.get(name)}`);
      else seen.set(name, rel);
    }
    if (fm?.metadata?.tier === 'router') routers += 1;

    const yamlFile = path.join(dir, entry.name, 'agents', 'openai.yaml');
    const yamlRel = `${rel}/agents/openai.yaml`;
    if (!fs.existsSync(yamlFile)) {
      errors.push(`${yamlRel}: is missing`);
      continue;
    }
    const y = parseOpenaiYaml(fs.readFileSync(yamlFile, 'utf8'));
    const ui = typeof y.interface === 'object' ? y.interface : {};
    if (!ui.display_name) errors.push(`${yamlRel}: interface.display_name is missing`);
    if (!ui.short_description) errors.push(`${yamlRel}: interface.short_description is missing`);
    if (ui.screenshots !== undefined) errors.push(`${yamlRel}: interface.screenshots is set; a skills-only plugin carries none`);
    if (y.policy !== undefined) {
      const keys = typeof y.policy === 'object' ? Object.keys(y.policy) : ['(not a mapping)'];
      const extra = keys.filter((k) => !POLICY_KEYS.has(k));
      if (extra.length) {
        errors.push(`${yamlRel}: policy holds ${extra.join(', ')}; only products and allow_implicit_invocation are allowed`);
      }
    }
  }
  return { errors, skills, routers };
}

// ------------------------------------------------------------------ entries

/** Every file under a folder, as POSIX paths relative to `base`. */
function walk(abs, base) {
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

const REPO_URL = 'https://github.com/Community-Access/accessibility-agents';

/**
 * Relative links in README.md and PRIVACY.md point into folders this package
 * leaves out; send them to the repository instead, as
 * scripts/build-claude-plugin.mjs does. Anchors and absolute URLs stay.
 */
export function absoluteLinks(text, repo = REPO_URL) {
  return text.replace(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g, (_, target) => {
    const clean = target.replace(/^\.\//, '');
    const kind = /\.[a-z0-9]+(#.*)?$/i.test(clean) ? 'blob' : 'tree';
    return `](${repo}/${kind}/main/${clean})`;
  });
}

/** The archive's contents, in order: plugin.json first, then the rest. */
export function collectEntries(root, manifest) {
  const entries = [{ name: 'plugin.json', data: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8') }];
  const errors = [];
  const repo = typeof manifest.repository === 'string' ? manifest.repository.replace(/\/$/, '') : REPO_URL;
  for (const file of ROOT_FILES) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) {
      errors.push(`${file}: is missing`);
      continue;
    }
    const data = fs.readFileSync(abs);
    entries.push({ name: file, data: file.endsWith('.md') ? Buffer.from(absoluteLinks(data.toString('utf8'), repo), 'utf8') : data });
  }
  for (const [target, source] of Object.entries(IMAGES)) {
    const abs = path.join(root, source);
    if (!fs.existsSync(abs)) {
      errors.push(`${source}: is missing (copied to ${target})`);
      continue;
    }
    const data = fs.readFileSync(abs);
    errors.push(...checkImage(`${source} (as ${target})`, data));
    entries.push({ name: target, data });
  }
  const skillsDir = path.join(root, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const rel of walk(skillsDir, root)) entries.push({ name: rel, data: fs.readFileSync(path.join(root, rel)) });
  }
  return { entries, errors };
}

/** What the archive must and must not contain, by name. */
export function checkEntryNames(names, manifest) {
  const errors = [];
  if (names.filter((n) => n === 'plugin.json').length !== 1) errors.push('archive: must hold exactly one plugin.json at its root');
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) errors.push(`${name}: appears twice in the archive`);
    seen.add(name);
    const segments = name.split('/');
    if (!name || name.includes('\\') || name.startsWith('/') || /^[A-Za-z]:/.test(name)) {
      errors.push(`${name}: archive paths must be relative and use / only`);
    }
    if (segments.includes('..') || segments.includes('.')) errors.push(`${name}: archive paths may not contain . or .. segments`);
    if (FORBIDDEN_BASENAMES.has(segments.at(-1)) || segments.some((s) => FORBIDDEN_SEGMENTS.has(s))) {
      errors.push(`${name}: hooks, MCP and app configuration may not be in a skills-only package`);
    }
    if (segments.length > 1 && segments[0] !== 'skills' && segments[0] !== 'assets') {
      errors.push(`${name}: only skills/ and assets/ may hold folders in this package`);
    }
  }
  const ui = manifest?.extensions?.['com.openai.interface'] || {};
  for (const key of ['logo', 'composerIcon']) {
    if (typeof ui[key] !== 'string') continue;
    const target = ui[key].replace(/^\.\//, '');
    if (!seen.has(target)) errors.push(`plugin.json (generated): interface.${key} points at ${ui[key]}, which is not in the archive`);
  }
  return errors;
}

/** Size and count limits, against the archive as written. */
export function checkArchive(buffer) {
  const errors = [];
  if (buffer.length >= LIMITS.archiveBytes) errors.push(`archive: ${buffer.length} bytes; the limit is under 100 MB`);
  let names;
  try {
    names = readZipNames(buffer);
  } catch (err) {
    return [...errors, `archive: cannot be read back (${err.message})`];
  }
  if (names.length >= LIMITS.archiveEntries) errors.push(`archive: ${names.length} entries; the limit is under ${LIMITS.archiveEntries}`);
  for (const name of names) {
    if (name.includes('\\') || name.startsWith('/') || name.split('/').includes('..')) {
      errors.push(`${name}: archive paths must be relative, use / only and contain no ..`);
    }
  }
  return errors;
}

// --------------------------------------------------------------------- zip

/** A stored-or-deflated ZIP, UTF-8 names, fixed timestamps so builds repeat. */
export function writeZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  const DOS_TIME = 0;
  const DOS_DATE = (0 << 9) | (1 << 5) | 1; // 1980-01-01
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;
    const crc = zlib.crc32(data) >>> 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(useDeflate ? 8 : 0, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

/** Entry names from a ZIP's central directory. */
export function readZipNames(buffer) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 0xffff); i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error('no end of central directory record');
  const count = buffer.readUInt16LE(eocd + 10);
  let at = buffer.readUInt32LE(eocd + 16);
  const names = [];
  for (let i = 0; i < count; i += 1) {
    if (buffer.readUInt32LE(at) !== 0x02014b50) throw new Error(`bad central directory entry ${i}`);
    const nameLen = buffer.readUInt16LE(at + 28);
    const extraLen = buffer.readUInt16LE(at + 30);
    const commentLen = buffer.readUInt16LE(at + 32);
    names.push(buffer.toString('utf8', at + 46, at + 46 + nameLen));
    at += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}

// --------------------------------------------------------------------- run

/** Check everything, then build. Returns { errors, manifest, zip, entries, file }. */
export function packagePlugin({ root = REPO, outDir = path.join(root, 'dist'), write = true } = {}) {
  const errors = [];
  const readJson = (rel) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
    } catch (err) {
      errors.push(`${rel}: cannot be read as JSON (${err.code || err.message})`);
      return null;
    }
  };
  const base = readJson('plugin.json');
  const pkg = readJson('package.json');
  if (!base || !pkg) return { errors };

  const skills = checkSkills(root, base.name);
  errors.push(...skills.errors);

  const manifest = buildManifest(base, skills);
  errors.push(...checkManifest(manifest));

  const { entries, errors: entryErrors } = collectEntries(root, manifest);
  errors.push(...entryErrors);
  errors.push(...checkEntryNames(entries.map((e) => e.name), manifest));
  if (errors.length) return { errors, manifest };

  const zip = writeZip(entries);
  errors.push(...checkArchive(zip));
  if (errors.length) return { errors, manifest };

  const file = path.join(outDir, `accessibility-agents-openai-${pkg.version}.zip`);
  if (write) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(file, zip);
  }
  return { errors, manifest, zip, entries, file, skills: skills.skills };
}

function main(argv) {
  const opt = (flag) => {
    const i = argv.indexOf(flag);
    return i === -1 ? null : argv[i + 1];
  };
  const root = path.resolve(opt('--root') || REPO);
  const outDir = path.resolve(opt('--out') || path.join(root, 'dist'));
  const write = !argv.includes('--check');
  const result = packagePlugin({ root, outDir, write });

  if (result.errors.length) {
    console.error(`package:openai: ${result.errors.length} problem${result.errors.length === 1 ? '' : 's'}; nothing was written.`);
    for (const e of result.errors) console.error(`  ${e}`);
    return 1;
  }
  if (argv.includes('--print-manifest')) {
    console.log(JSON.stringify(result.manifest, null, 2));
    return 0;
  }
  const rel = path.relative(process.cwd(), result.file).split(path.sep).join('/');
  const verb = write ? 'Wrote' : 'Checked (not written)';
  console.log(`${verb} ${rel}: ${result.zip.length} bytes, ${result.entries.length} entries, ${result.skills} skills.`);
  console.log('All OpenAI plugin directory checks pass.');
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
