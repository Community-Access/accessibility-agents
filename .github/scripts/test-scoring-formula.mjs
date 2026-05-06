// test-scoring-formula.mjs
// Validates web severity scoring formula produces expected page scores.
// Formula: page_score = 100 - sum(base × multiplier)
//   confirmed multiplier = 1.2, all others = 1.0
//
// Usage: node .github/scripts/test-scoring-formula.mjs

// Base deduction table from web-severity-scoring SKILL.md
const BASE = {
  critical: { confirmed: 18, high_both: 15, high_single: 10, medium: 7, low: 3 },
  serious:  { confirmed: 10, high_both: 7,  high_single: 7,  medium: 5, low: 2 },
  moderate: { confirmed: 5,  high_both: 3,  high_single: 3,  medium: 2, low: 1 },
  minor:    { confirmed: 2,  high_both: 1,  high_single: 1,  medium: 1, low: 1 },
};

const CONFIRMED_MULTIPLIER = 1.2;

function computeScore(findings) {
  let total = 0;
  for (const f of findings) {
    const base = BASE[f.severity]?.[f.confidence] ?? 1;
    const multiplier = f.confidence === 'confirmed' ? CONFIRMED_MULTIPLIER : 1.0;
    total += base * multiplier;
  }
  return Math.max(0, Math.floor(100 - total));
}

// Test cases
const tests = [
  {
    label: 'No findings → 100',
    findings: [],
    expected: 100,
  },
  {
    label: 'One critical/confirmed → 78 (100 - 18 × 1.2 = 78.4 → 78)',
    findings: [{ severity: 'critical', confidence: 'confirmed' }],
    expected: 78,
  },
  {
    label: 'One critical/high_both → 85 (100 - 15)',
    findings: [{ severity: 'critical', confidence: 'high_both' }],
    expected: 85,
  },
  {
    label: 'One minor/high_both → 99 (100 - 1)',
    findings: [{ severity: 'minor', confidence: 'high_both' }],
    expected: 99,
  },
  {
    label: 'Two serious/medium → 90 (100 - 5 - 5)',
    findings: [
      { severity: 'serious', confidence: 'medium' },
      { severity: 'serious', confidence: 'medium' },
    ],
    expected: 90,
  },
  {
    label: 'Score floors at 0',
    findings: Array.from({ length: 20 }, () => ({ severity: 'critical', confidence: 'confirmed' })),
    expected: 0,
  },
];

let passed = 0;
let failed = 0;

for (const t of tests) {
  const actual = computeScore(t.findings);
  if (actual === t.expected) {
    console.log(`PASS  ${t.label}`);
    passed++;
  } else {
    console.error(`FAIL  ${t.label}`);
    console.error(`      expected ${t.expected}, got ${actual}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
