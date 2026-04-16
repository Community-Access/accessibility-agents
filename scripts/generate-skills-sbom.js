#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function collectSkillComponents(repoRoot) {
  const skillsDir = path.join(repoRoot, '.github', 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  const components = [];
  for (const dir of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const relPath = path.relative(repoRoot, skillFile).replace(/\\/g, '/');
    components.push({
      type: 'file',
      name: dir.name,
      version: '5.0.0',
      purl: `pkg:generic/community-access/${dir.name}@5.0.0`,
      properties: [
        { name: 'skill.path', value: relPath },
        { name: 'skill.kind', value: 'agent-skill' },
      ],
      hashes: [
        { alg: 'SHA-256', content: sha256File(skillFile) },
      ],
    });
  }
  return components.sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  const repoRoot = process.cwd();
  const outDir = path.join(repoRoot, 'artifacts');
  fs.mkdirSync(outDir, { recursive: true });

  const components = collectSkillComponents(repoRoot);
  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        type: 'application',
        name: 'accessibility-agents-skills',
        version: '5.0.0',
      },
      tools: [
        {
          vendor: 'Community-Access',
          name: 'generate-skills-sbom',
          version: '1.0.0',
        },
      ],
    },
    components,
  };

  const outputPath = path.join(outDir, 'skills-sbom.cdx.json');
  fs.writeFileSync(outputPath, JSON.stringify(sbom, null, 2));
  console.log(`Wrote ${outputPath}`);
}

main();
