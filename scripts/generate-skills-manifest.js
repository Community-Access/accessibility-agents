#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function collectSkillFiles(repoRoot) {
  const skillsDir = path.join(repoRoot, '.github', 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  const files = [];
  for (const dir of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      files.push(skillFile);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function main() {
  const repoRoot = process.cwd();
  const outDir = path.join(repoRoot, 'artifacts');
  fs.mkdirSync(outDir, { recursive: true });

  const skillFiles = collectSkillFiles(repoRoot);
  const manifest = {
    schema: 'community-access.skills-manifest.v1',
    generatedAt: new Date().toISOString(),
    repository: 'Community-Access/accessibility-agents',
    fileCount: skillFiles.length,
    files: skillFiles.map((filePath) => {
      const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
      return {
        path: relPath,
        sha256: sha256File(filePath),
      };
    }),
  };

  const outputPath = path.join(outDir, 'skills-manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${outputPath}`);
}

main();
