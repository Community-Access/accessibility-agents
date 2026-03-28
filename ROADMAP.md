# Roadmap

Current version: **4.6.0** | Next major: **5.0**

Full planning details: [5.0 Release Plan](docs/5.0-RELEASE-PLAN.md)

---

## 5.0 -- Detection to Remediation

Version 5.0 transitions the project from an advisory scanning tool to a full remediation and compliance platform. Three release themes:

### Theme 1: Fix, Not Just Find

| Feature | Priority | Issue | Status |
|---------|----------|-------|--------|
| Office document remediation MCP tools | Critical | [#11](https://github.com/Community-Access/accessibility-agents/issues/11) | |
| PDF remediation MCP tools | Critical | [#11](https://github.com/Community-Access/accessibility-agents/issues/11) | |
| Web source auto-fix MCP tool | Critical | -- | |
| Markdown auto-fix MCP tool | Medium | -- | |
| Fix verification loop (apply, re-scan, confirm) | Critical | -- | |
| veraPDF SARIF integration | High | [#10](https://github.com/Community-Access/accessibility-agents/issues/10) | Shipped in 4.6.0 |
| EPUB MCP scanning tool | Medium | -- | Shipped in 4.6.0 |
| Markdown MCP scanning tool | Medium | -- | Shipped in 4.6.0 |
| Component audit caching | Medium | -- | Shipped in 4.6.0 |

### Theme 2: Ship as a Product

| Feature | Priority | Issue |
|---------|----------|-------|
| VS Code Marketplace extension (`@a11y` chat participant) | Critical | -- |
| npm package (`@a11y-agent-team/mcp-server`) | High | -- |
| Anthropic Connectors Directory listing | High | [#9](https://github.com/Community-Access/accessibility-agents/issues/9) |
| GitHub Marketplace reusable action | Medium | -- |
| `npx` zero-install quickstart | High | -- |

### Theme 3: Enterprise Compliance

| Feature | Priority | Issue |
|---------|----------|-------|
| Audit history persistence (`.a11y-history/`) | Medium | -- |
| Trend dashboard (WebView and MCP resource) | Medium | -- |
| VPAT generation from live audit data | Medium | -- |
| Multi-repo organizational scanning | Medium | -- |
| Compliance export (Section 508, EN 301 549, EAA) | Medium | -- |

### Cross-Cutting

| Feature | Priority | Issue | Status |
|---------|----------|-------|--------|
| Runtime sub-agent delegation across platforms | High | [#83](https://github.com/Community-Access/accessibility-agents/issues/83) | Shipped in 4.6.0 |
| Full code and security review | High | [#19](https://github.com/Community-Access/accessibility-agents/issues/19) | Shipped in 4.6.0 |
| Multi-language support (stretch) | Low | [#14](https://github.com/Community-Access/accessibility-agents/issues/14) | |

---

## Completed (4.x)

See the [changelog](CHANGELOG.md) for everything shipped through 4.6.0, including:

- 80 agent definitions across 5 platforms
- MCP server with 30+ tools, Streamable HTTP + SSE transport
- Playwright behavioral scanning (5 tools)
- 102 document accessibility rules (46 Office + 56 PDF)
- Rebuilt installation tooling with 16 CLI flags
- VS Code 1.113 alignment
- ePub accessibility scanning and MCP tools (4.6)
- Markdown scanning MCP tools (4.6)
- veraPDF SARIF integration (4.6)
- Audit cache enhancement with TTL and size limits (4.6)
- Guided MCP server installation wizard
- 5 security hardening fixes (4.6)

---

## Have an Idea?

Open an [issue](https://github.com/Community-Access/accessibility-agents/issues/new) or start a [discussion](https://github.com/Community-Access/accessibility-agents/discussions).
