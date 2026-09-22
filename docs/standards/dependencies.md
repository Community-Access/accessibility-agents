# Dependency supply chain

No shipped dependency carries a known high or critical advisory, and a gate
checks that against the registry rather than assuming it.

| | |
|---|---|
| Source of truth | the npm advisory database, via `npm audit` |
| Also reported by | GitHub Dependabot on the default branch |
| Governs here | three independent dependency trees |
| Checked by | `npm run verify:deps`, part of `npm run verify` |

## The three trees, and why their thresholds differ

Each tree, with what it is for and what fails the gate.

| Tree | What it is | Fails on |
|---|---|---|
| `mcp-server` | runtime. Executes on a user machine and reads their documents | high, critical |
| root | tooling only, but runs in CI on every pull request | high, critical |
| `vscode-extension` | deprecated, build-time only, published to nobody | reported, never fatal |

Offline is not a pass. When the registry cannot be reached the gate exits 2 and
says so, rather than printing a green line it has not earned.

## Transitive dependencies with no fixed parent

Three of the MCP server's advisories were in packages it does not depend on
directly: `fast-uri` through ajv, `hono` through the MCP SDK, and `ip-address`
through express-rate-limit. Upgrading the SDK from 1.27.1 to 1.30.0 moved them
forward but not far enough.

They are pinned in `mcp-server/package.json` under `overrides`, each to its
first patched release, and each is inside the range its parent asks for.

| Package | Parent asks for | Pinned to | Advisories closed |
|---|---|---|---:|
| `fast-uri` | `^3.0.1`, by ajv | `^3.1.6` | 5 |
| `hono` | `^4.11.4`, by the MCP SDK | `^4.12.25` | 1 |
| `ip-address` | `^10.2.0`, by express-rate-limit | `^10.3.1` | 1 |

An override raises a floor; it does not force an incompatible version. Remove
one once its parent ships a range that cannot resolve below the patched
release.

## Why this gate exists

Until 7.0.1 nothing in the repository checked any dependency tree. GitHub was
reporting 58 advisories on the default branch, 24 of them high, and the only
place that appeared was the warning `git push` prints. A project that enforces
accessibility on other people's code should not learn about its own supply
chain from a push message.

## Reproducing

```bash
npm run verify:deps
npm audit --prefix mcp-server
```

## Sources

- npm audit: <https://docs.npmjs.com/cli/commands/npm-audit>
- npm overrides: <https://docs.npmjs.com/cli/configuring-npm/package-json#overrides>
- Dependabot alerts: <https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts>
