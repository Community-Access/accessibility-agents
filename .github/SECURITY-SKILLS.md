# Skills Supply Chain Security

This document describes the supply-chain controls for skill artifacts in this
repository, as they stand in 7.x.

## Scope

Applies to the skills in `skills/*/` (each `SKILL.md`, its `references/`,
`scripts/` and `agents/openai.yaml`), the hook guard in `hooks/`, and the
dependency trees of the root tooling and `mcp-server/`.

## Controls in place

### 1. Dependency advisories

- `node scripts/verify-dependencies.mjs` (the `dependencies` gate in
  `npm run verify`) runs `npm audit` on the root, `mcp-server/` and
  `vscode-extension/` trees.
- It fails on a high or critical advisory in the root or `mcp-server/` tree,
  and treats the registry being unreachable as "not checked", not as a pass.

### 2. Version consistency

- `node scripts/check-release-consistency.js` fails when the package,
  plugin and MCP server manifests disagree on the version, so a user can tell
  which build they run.

### 3. Automated update pull requests

- `.github/dependabot.yml` opens weekly update pull requests for GitHub
  Actions, for npm in `/vscode-extension` only, and for pip in `/scripts`.
- The root and `mcp-server/` npm trees are not covered by Dependabot; the
  dependency gate (`scripts/verify-dependencies.mjs`) checks them instead.

### 4. Review of changes

- Every change goes through a pull request; `npm run verify` runs in CI
  (`.github/workflows/verify.yml`).

## Controls not in place

Earlier versions of this page described an integrity manifest, HMAC-signed
manifest metadata, a CycloneDX SBOM of the skills and a
`skills-supply-chain.yml` workflow. None of those scripts or workflows exists
in this repository today, so nothing signs or fingerprints skill files. If you
need that assurance, pin the plugin or checkout to a reviewed commit and
compare against it.

## Incident Response

If tampering is suspected:

1. Report it privately, as described in [SECURITY.md](../SECURITY.md)
2. Compare the installed skills against a known-good commit of this repository
3. Investigate commit history and workflow run logs
4. Publish remediation notes in the release documentation
