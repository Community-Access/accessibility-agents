#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function main() {
  const repoRoot = process.cwd();
  const manifestPath = path.join(repoRoot, 'artifacts', 'skills-manifest.json');
  const outPath = path.join(repoRoot, 'artifacts', 'skills-manifest.sig.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const secret = process.env.GH_SKILLS_SIGNING_KEY;
  const requireSigning = String(process.env.REQUIRE_SIGNING || '').toLowerCase() === 'true';

  let signature;
  let algorithm;
  let signed = false;

  if (secret && secret.trim().length > 0) {
    signature = crypto.createHmac('sha256', secret).update(manifestRaw).digest('hex');
    algorithm = 'HMAC-SHA256';
    signed = true;
  } else {
    if (requireSigning) {
      throw new Error('GH_SKILLS_SIGNING_KEY is required when REQUIRE_SIGNING=true');
    }
    signature = null;
    algorithm = 'UNSIGNED';
  }

  const payload = {
    schema: 'community-access.skills-signature.v1',
    generatedAt: new Date().toISOString(),
    manifest: 'artifacts/skills-manifest.json',
    digest: crypto.createHash('sha256').update(manifestRaw).digest('hex'),
    signature,
    algorithm,
    signed,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${outPath} (${signed ? 'signed' : 'unsigned'})`);
}

main();
