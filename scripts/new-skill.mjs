#!/usr/bin/env node
/**
 * new-skill.mjs - scaffold a skill that passes every gate on its first run.
 *
 * A contributor who writes frontmatter from memory gets one of a dozen things
 * wrong: an unquoted colon in the description, a missing Codex policy file, a
 * tier the validator does not know, a name that does not match the directory.
 * Each of those is caught by a gate, but caught after the work rather than
 * before it. This writes the skeleton correctly, so the only thing left to
 * write is the skill.
 *
 * Usage:
 *   node scripts/new-skill.mjs <name> --tier specialist --domain web --title "Focus Order Reviewer"
 *   node scripts/new-skill.mjs kb-my-rules --tier reference --domain documents --title "My Rules"
 *
 * Tiers: specialist (default), helper, reference. Routers are not scaffolded;
 * adding one is an architectural decision, not a file.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const argv = process.argv.slice(2);
const name = argv.find((a) => !a.startsWith('--'));
const opt = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i === -1 ? fallback : argv[i + 1];
};
const tier = opt('--tier', 'specialist');
const domain = opt('--domain', 'web');
const title = opt('--title', null);
const description = opt('--description', null);

const DOMAINS = ['web', 'documents', 'markdown', 'github', 'developer', 'desktop', 'cross-cutting'];
const TIERS = { specialist: { output: 'findings', effort: 'medium' }, helper: { output: 'findings', effort: 'low' }, reference: { output: 'none', effort: 'low' } };

function die(msg) {
  console.error(msg);
  process.exit(2);
}

if (!name) die('Usage: new-skill.mjs <name> --tier specialist|helper|reference --domain <domain> --title "Title"');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) die(`"${name}" is not a lowercase hyphen slug`);
if (name.length > 64) die('names are limited to 64 characters by the Agent Skills specification');
if (!TIERS[tier]) die(`tier must be one of ${Object.keys(TIERS).join(', ')}`);
if (!DOMAINS.includes(domain)) die(`domain must be one of ${DOMAINS.join(', ')}`);
if (tier === 'reference' && !name.startsWith('kb-')) die('reference skills are named kb-<topic> so they cannot collide with a specialist');

const dir = path.join(ROOT, 'skills', name);
if (fs.existsSync(dir)) die(`skills/${name} already exists`);

const displayTitle = title || name.replace(/^kb-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const desc = description || (tier === 'reference' ? `Reference data, not a reviewer. Describe what this holds in one sentence.` : `Describe in one sentence, under 120 characters, what this skill checks.`);

// Frontmatter. The description is always quoted so a colon cannot turn it
// into a YAML mapping, which is the single most common way a skill fails the
// specification validator.
const fm = [
  '---',
  `name: ${name}`,
  `description: ${JSON.stringify(desc)}`,
  'license: MIT',
  'disable-model-invocation: true',
];
if (tier !== 'specialist') fm.push('user-invocable: false');
fm.push(
  'metadata:',
  `  tier: ${tier}`,
  `  domain: ${domain}`,
  `  output: ${TIERS[tier].output}`,
  `  effort: ${TIERS[tier].effort}`,
  `  title: ${JSON.stringify(displayTitle)}`,
  '---',
);

const body =
  tier === 'reference'
    ? [
        `Reference data for ${displayTitle}. State in one paragraph what a skill`,
        'finds here and when it should open this file rather than guess.',
        '',
        '## Contents',
        '',
        'Replace this with the rule table, URL registry or formula this skill holds.',
        '',
      ]
    : [
        `You are the ${displayTitle}. State in two sentences what you check and`,
        'what you deliberately leave to another skill.',
        '',
        '## What you check',
        '',
        '- One concrete check per line, phrased as the defect you would report',
        '- Keep the whole body under 6 KiB; put the long tail in references/',
        '',
        '## What you do not check',
        '',
        'Name the neighbouring skill that owns each thing you skip, so a router',
        'can send it there.',
        '',
        '## Reference files',
        '',
        'Read one only when the task reaches it. Do not read them all up front.',
        '',
        '- `references/checklist.md` - the full checklist, one line per rule',
        '',
        '## Output contract',
        '',
        'Return only JSON matching `skills/a11y-core/schemas/findings.schema.json`.',
        'No prose, no summary, no restated instructions. One object, one array of findings.',
        '',
        'Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.',
        'Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.',
        '',
      ];

fs.mkdirSync(path.join(dir, 'agents'), { recursive: true });
fs.writeFileSync(path.join(dir, 'SKILL.md'), fm.join('\n') + '\n' + body.join('\n'), 'utf8');

// The Codex policy file. Without it Codex lists the skill in the model's
// catalog whatever the frontmatter says; a live probe proved that.
fs.writeFileSync(
  path.join(dir, 'agents', 'openai.yaml'),
  [
    '# Codex interface for this skill. Non-routers are dispatched by a router,',
    '# never picked implicitly, so they stay out of the model-facing catalog.',
    'interface:',
    `  display_name: ${JSON.stringify(displayTitle)}`,
    `  short_description: ${JSON.stringify(desc)}`,
    'policy:',
    '  allow_implicit_invocation: false',
    '',
  ].join('\n'),
  'utf8',
);

if (tier !== 'reference') {
  fs.mkdirSync(path.join(dir, 'references'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'references', 'checklist.md'),
    `# ${displayTitle} checklist\n\nPart of the \`${name}\` skill. Read this when the task reaches the detailed pass.\n\n- Rule ID, WCAG criterion, what to look for, what to say when it fails\n`,
    'utf8',
  );

  fs.mkdirSync(path.join(dir, 'examples'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'examples', 'findings.json'),
    JSON.stringify(
      {
        skill: name,
        scope: ['src/example.tsx'],
        findings: [
          {
            rule: 'EXAMPLE-001',
            wcag: '4.1.2 A',
            severity: 'serious',
            confidence: 'high',
            location: 'src/example.tsx:12',
            summary: 'One sentence naming the defect.',
            fix: 'What to change, concretely enough to act on without re-reading the file.',
          },
        ],
        passed: ['A check that ran and found nothing'],
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
}

console.log(`Created skills/${name} (${tier}, ${domain})`);
console.log('');
console.log('Next:');
console.log(`  1. Write the body of skills/${name}/SKILL.md`);
if (tier !== 'reference') console.log(`  2. Replace the example in skills/${name}/examples/findings.json with a real one`);
console.log('  3. node scripts/build-dispatch-matrices.mjs   (so a router can reach it)');
console.log('  4. npm run verify');
process.exit(0);
