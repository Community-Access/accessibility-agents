#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const required = [
  'artifacts/skills-manifest.json',
  'artifacts/skills-manifest.sig.json',
  'artifacts/skills-sbom.cdx.json',
];

let failed = false;
for (const rel of required) {
  const abs = path.join(process.cwd(), rel);
  if (!fs.existsSync(abs)) {
    console.error(`Missing artifact: ${rel}`);
    failed = true;
    continue;
  }
  const stat = fs.statSync(abs);
  if (stat.size === 0) {
    console.error(`Empty artifact: ${rel}`);
    failed = true;
    continue;
  }
  console.log(`OK: ${rel} (${stat.size} bytes)`);
}

if (failed) {
  process.exit(1);
}
console.log('All skills artifacts are present and non-empty.');
