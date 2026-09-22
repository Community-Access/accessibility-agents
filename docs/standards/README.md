# Standards

One page per standard this package conforms to. Each page states the version
relied on, the clauses that matter to this package, how conformance is checked
rather than asserted, and any deviation, plainly.

| Standard | Governs here | Checked by |
|---|---|---|
| [Agent Skills](agent-skills.md) | every file under `skills/` | the specification authors' validator, `npm run verify:spec` |
| [AGENTS.md](agents-md.md) | the always-on contract | size and content, `npm run verify:skills` |
| [Agent Plugins 1.0](agent-plugins.md) | `plugin.json` and the client manifests | `claude plugin validate .`, `npm run verify:release` |
| [Model Context Protocol](mcp.md) | the 39 scanner tools | a real client over stdio, `npm run verify:mcp` |
| [WCAG 2.2](wcag.md) | every criterion a finding cites | `npm run verify:findings` |
| [Hooks, by client](hooks-by-client.md) | the enforcement gate | 22 tests, `node --test hooks/guard.test.mjs` |

The [conformance dossier](conformance.md) collects the gates, the measured
results, the defects found on the way, and the live-client evidence.

Two policy pages sit beside the standards: the [citation policy](citation-policy.md)
every skill follows when it names a criterion, and the
[research sources](research-sources.md) the skills were built from.

## How a standard earns a page here

It has to govern something in the repository, and something in the repository
has to check it. A standard we merely admire does not get a page.
