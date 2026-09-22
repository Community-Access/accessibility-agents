#!/usr/bin/env node
/**
 * phase2-restructure.mjs - one-shot Phase 2 reorganisation of the routers.
 *
 * Phase 1 split every agent mechanically: whatever fitted the byte budget
 * stayed in SKILL.md and the rest was bundled in document order. That met the
 * budget but left arbitrary content in the core body - the web wizard kept
 * phases 1 and 8 and exiled 2 through 7 - and named reference files after
 * whichever section happened to come first.
 *
 * This script fixes the mechanical residue so the routers can be hand-authored
 * on top of it:
 *   1. Moves phase content still inline in a router's SKILL.md into the right
 *      reference file, so the router lists phases rather than performing one.
 *   2. Renames reference files to say what they hold.
 *
 * After this runs, `skills/` is the source of truth. The migration script
 * refuses to overwrite it without --force.
 *
 * Usage: node scripts/phase2-restructure.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SKILLS = path.join(ROOT, 'skills');

/**
 * Sections still sitting in a router's SKILL.md that belong in a reference,
 * and the reference file each should join.
 */
const RELOCATE = {
  'web-accessibility-wizard': [
    { heading: 'Phase 1: Structure and Semantics', into: 'phases-1-8-domain-checks.md', position: 'start' },
    { heading: 'Phase 8: Links and Navigation', into: 'phases-1-8-domain-checks.md', position: 'end' },
  ],
  'markdown-a11y-assistant': [
    { heading: 'Phase 1: File Discovery', into: 'phases-1-3-scanning.md', position: 'start' },
    { heading: 'Phase 2: Parallel Scanning', into: 'phases-1-3-scanning.md', position: 'start' },
    { heading: 'Severity Scoring', into: 'phases-1-3-scanning.md', position: 'end' },
    { heading: 'Markdown Scan Context', into: 'phases-1-3-scanning.md', position: 'start' },
  ],
};

/** Reference files renamed to describe their contents. */
const RENAME = {
  'web-accessibility-wizard': {
    'phase-2-keyboard-navigation-and-focus.md': 'phases-1-8-domain-checks.md',
    'phase-0-project-discovery.md': 'phase-0-discovery.md',
    'sub-agent-delegation-model.md': 'delegation-and-scan-context.md',
    'mandatory-screenshot-capture.md': 'screenshots-and-scope.md',
    'phase-9-testing-recommendations.md': 'phases-9-10-testing.md',
    'phase-11-final-report-and-action-plan.md': 'phase-11-report-template.md',
    'phase-11-follow-up-actions.md': 'phase-11-handoffs.md',
    'phase-12-ci-cd-integration-guide.md': 'phase-12-ci-and-config.md',
  },
  'markdown-a11y-assistant': {
    'phase-0-discovery-and-configuration.md': 'phase-0-discovery.md',
    'markdown-accessibility-assistant.md': 'phases-1-3-scanning.md',
    'phase-3-review-gate.md': 'phase-3-review-gate.md',
    'excellence-guidelines.md': 'excellence-guidelines.md',
  },
  'document-accessibility-wizard': {
    'phase-2-document-scanning.md': 'phases-1-3-scanning.md',
    'phase-4-report-generation.md': 'phase-4-report-and-export.md',
    'output-path.md': 'output-and-behaviour.md',
    'behavioral-rules.md': 'behavioural-rules.md',
    'remediation-writing-standard.md': 'remediation-writing-standard.md',
  },
  'accessibility-lead': {
    'your-team.md': 'team-and-coordination.md',
    'decision-matrix.md': 'decision-matrix.md',
    'multi-agent-reliability.md': 'reliability.md',
  },
  'developer-hub': {
    'developer-hub-the-developer-workflow-orchestrato.md': 'role-and-capabilities.md',
    'intent-classification.md': 'intent-classification.md',
  },
  'github-hub': {
    'github-hub-the-github-workflow-orchestrator.md': 'role-and-capabilities.md',
    'guided-prompts-menu.md': 'guided-prompts-menu.md',
    'multi-agent-reliability.md': 'reliability.md',
  },
};

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: '', body: text };
  return { fm: m[0], body: text.slice(m[0].length) };
}

/** Pull one `## ` section out of a body, fence-aware. Returns [section, rest]. */
function extractSection(body, heading) {
  const lines = body.split('\n');
  const out = [];
  const grabbed = [];
  let fence = null;
  let grabbing = false;

  for (const line of lines) {
    const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
    }
    if (!fence && /^## \S/.test(line)) {
      grabbing = line.replace(/^##\s+/, '').trim() === heading;
    }
    (grabbing ? grabbed : out).push(line);
  }
  return [grabbed.join('\n').trim(), out.join('\n')];
}

function tidy(text) {
  return text.replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n';
}

let renamed = 0;
let moved = 0;

// Renames first, so relocation targets exist under their new names.
for (const [skill, map] of Object.entries(RENAME)) {
  const dir = path.join(SKILLS, skill, 'references');
  if (!fs.existsSync(dir)) continue;
  for (const [from, to] of Object.entries(map)) {
    if (from === to) continue;
    const src = path.join(dir, from);
    const dst = path.join(dir, to);
    if (!fs.existsSync(src)) continue;
    if (fs.existsSync(dst)) {
      fs.appendFileSync(dst, '\n' + fs.readFileSync(src, 'utf8'));
      fs.rmSync(src);
    } else {
      fs.renameSync(src, dst);
    }
    renamed += 1;
  }
}

for (const [skill, jobs] of Object.entries(RELOCATE)) {
  const skillFile = path.join(SKILLS, skill, 'SKILL.md');
  if (!fs.existsSync(skillFile)) continue;
  const raw = fs.readFileSync(skillFile, 'utf8');
  const { fm, body } = splitFrontmatter(raw);
  let rest = body;

  for (const job of jobs) {
    const [section, remaining] = extractSection(rest, job.heading);
    if (!section) continue;
    rest = remaining;

    const target = path.join(SKILLS, skill, 'references', job.into);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, `# ${skill} reference: domain checks\n\n`, 'utf8');
    }
    const current = fs.readFileSync(target, 'utf8');
    if (job.position === 'start') {
      const headerEnd = current.indexOf('\n\n') + 2;
      fs.writeFileSync(target, current.slice(0, headerEnd) + section + '\n\n' + current.slice(headerEnd), 'utf8');
    } else {
      fs.writeFileSync(target, tidy(current) + '\n' + section + '\n', 'utf8');
    }
    moved += 1;
  }

  fs.writeFileSync(skillFile, fm + tidy(rest), 'utf8');
}

console.log(`Phase 2 restructure: ${renamed} reference files renamed, ${moved} sections relocated`);
console.log('skills/ is now the source of truth; routers are hand-authored from here.');
