# GitHub Skills CLI Readiness Guide

This guide documents the Phase 5 implementation for CLI readiness.

## Purpose

Ensure skills are structurally valid, packaged into deterministic artifacts, and ready for GitHub CLI-based distribution workflows.

## CI Workflow

Workflow file:
- .github/workflows/skills-cli-readiness.yml

What it does:
1. Runs validator with Phase 3 checks:
   - --strict
   - --validate-wcag
   - --validate-urls
   - --skip-url-checks
2. Generates:
   - artifacts/skills-manifest.json
   - artifacts/skills-sbom.cdx.json
   - artifacts/skills-manifest.sig.json
3. Verifies artifacts are present and non-empty.

## Local Execution

Run the same sequence locally:

powershell
node scripts/validate-agents.js --strict --validate-wcag --validate-urls --skip-url-checks
node scripts/generate-skills-manifest.js
node scripts/generate-skills-sbom.js
node scripts/sign-skills-manifest.js
node scripts/check-skills-artifacts.js

## Signing Behavior

The signature step uses GH_SKILLS_SIGNING_KEY when provided.

- PR/feature runs can operate unsigned (best effort).
- Main branch supply-chain workflow can enforce signing via REQUIRE_SIGNING=true.

## Expected Outputs

- Deterministic manifest with SHA-256 hashes per skill file
- CycloneDX 1.5 SBOM
- Signature payload describing signed/unsigned state

## Troubleshooting

If artifact verification fails:
1. Confirm scripts executed successfully.
2. Confirm artifacts directory exists.
3. Re-run each generator script individually.

If signing fails on main:
1. Ensure GH_SKILLS_SIGNING_KEY is set in repository secrets.
2. Confirm workflow has permission to read secrets.
