#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const skillsDir = path.join(repoRoot, '.github', 'skills');

const ACTION_VERBS = new Set([
  'audit', 'validate', 'review', 'check', 'scan', 'map', 'compute', 'generate',
  'integrate', 'analyze', 'track', 'test', 'format', 'discover', 'remediate',
  'detect', 'assess', 'optimize', 'build', 'manage'
]);

const STOPWORDS = new Set(['and', 'for', 'the', 'with', 'from', 'to', 'of', 'in', 'on', 'a', 'an', 'or']);

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const out = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim().replace(/^['"]|['"]$/g, '');
    out[key] = value;
  }
  return out;
}

function scoreDescription(skillName, description) {
  let score = 100;
  const notes = [];
  const d = description || '';
  const len = d.length;

  if (len < 90) {
    score -= 25;
    notes.push(`too short (${len} chars)`);
  }
  if (len > 200) {
    score -= 30;
    notes.push(`too long (${len} chars)`);
  }

  const lc = d.toLowerCase();
  const hasVerb = [...ACTION_VERBS].some(v => lc.includes(v));
  if (!hasVerb) {
    score -= 15;
    notes.push('missing clear action verb');
  }

  const nameTokens = skillName.toLowerCase().split('-').filter(t => t && !STOPWORDS.has(t));
  const tokenMatches = nameTokens.filter(t => lc.includes(t)).length;
  if (nameTokens.length > 0 && tokenMatches === 0) {
    score -= 20;
    notes.push('no skill-name token overlap');
  }

  if (!/[.!?]$/.test(d.trim())) {
    score -= 5;
    notes.push('no terminal punctuation');
  }

  // Bonus for specificity clues.
  if (/wcag|aria|ci|github|markdown|python|pdf|excel|word|powerpoint|react|vue|angular|svelte/i.test(d)) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));
  return { score, notes };
}

function collectSkills() {
  if (!fs.existsSync(skillsDir)) return [];
  const dirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  return dirs.map(dir => {
    const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
    const content = fs.readFileSync(skillFile, 'utf8');
    const fm = parseFrontmatter(content) || {};
    return {
      dir: dir.name,
      file: path.relative(repoRoot, skillFile).replace(/\\/g, '/'),
      name: fm.name || dir.name,
      description: fm.description || '',
    };
  });
}

function main() {
  const skills = collectSkills();
  if (skills.length === 0) {
    console.error('No skills found under .github/skills');
    process.exit(1);
  }

  let failed = false;
  let total = 0;

  console.log(`Checking description quality for ${skills.length} skills...`);
  for (const s of skills) {
    const { score, notes } = scoreDescription(s.name, s.description);
    total += score;
    const line = `${score.toString().padStart(3)}  ${s.file}`;

    if (score < 65) {
      failed = true;
      console.error(`FAIL ${line} :: ${notes.join('; ') || 'low quality'}`);
    } else if (score < 80) {
      console.warn(`WARN ${line} :: ${notes.join('; ') || 'borderline quality'}`);
    } else {
      console.log(`PASS ${line}`);
    }
  }

  const avg = Math.round(total / skills.length);
  console.log(`\nAverage quality score: ${avg}`);

  if (failed) {
    console.error('Description quality gate failed (score < 65 present).');
    process.exit(1);
  }

  console.log('Description quality gate passed.');
}

main();
