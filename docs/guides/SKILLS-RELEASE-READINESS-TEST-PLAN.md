# Skills Release Readiness Test Plan

This guide documents Phase 6 release-readiness testing.

## Scope

Validate cross-platform readiness for skills validation and artifact generation.

## CI Workflow

Workflow file:
- .github/workflows/skills-release-readiness.yml

Matrix:
- ubuntu-latest
- windows-latest
- macos-latest

Checks per OS:
1. Validate skills and agents (strict + Phase 3 flags).
2. Generate manifest, SBOM, and signature payload.
3. Verify generated artifacts are present.
4. Run release consistency check script.

## Local Smoke Test

Use this order:

powershell
node scripts/validate-agents.js --strict --validate-wcag --validate-urls --skip-url-checks
node scripts/generate-skills-manifest.js
node scripts/generate-skills-sbom.js
node scripts/sign-skills-manifest.js
node scripts/check-skills-artifacts.js
node scripts/check-release-consistency.js

## Exit Criteria

Release readiness is met when:
- All matrix jobs pass.
- No validation errors/warnings in strict mode.
- All artifacts are generated and non-empty.
- Release consistency check passes.

## Failure Handling

If one OS fails:
1. Inspect job logs for shell/path differences.
2. Reproduce locally on the same OS.
3. Patch scripts to avoid shell-specific assumptions.

If signing fails:
1. Check GH_SKILLS_SIGNING_KEY secret presence.
2. Confirm REQUIRE_SIGNING behavior is expected for the target branch.

## Reporting

Attach the following to release readiness review:
- Workflow run URL
- Artifact bundle from latest successful run
- Summary of any platform-specific deviations
