# Security Policy

## Scope

Accessibility Agents consists of Agent Skills (Markdown instructions, with some helper scripts under `skills/*/scripts/`), a Node.js hook guard (`hooks/guard.mjs`), a Node.js installer (`scripts/install.mjs`, run with `npm run setup`), and a Node.js MCP server (`mcp-server/`). The skills do not store credentials. The installer copies files into your home directory and writes hook manifests; it does not schedule updates.

## Supported Versions

The following table lists which versions currently receive security fixes.

| Version | Supported |
|---------|-----------|
| Latest release | Yes |
| Older releases | No |

We recommend always using the latest version. This package schedules no updates of its own. A plugin install updates the way your client's plugin settings say (Claude Code, for example, leaves auto-update off for third-party marketplaces unless you turn it on); a direct install updates when you pull the repository and run `npm run setup` again.

## Reporting a Vulnerability

If you discover a security issue, please report it responsibly.

**Do not open a public issue.**

Instead, email the maintainer directly or use [GitHub's private vulnerability reporting](https://github.com/Community-Access/accessibility-agents/security/advisories/new).

We will acknowledge receipt within 48 hours and provide a fix or mitigation as quickly as possible.

## What to Report

- The installer or the hook guard executing unintended commands
- MCP server (mcp-server) exposing data it should not
- Any file operation that could overwrite or delete user data unexpectedly

## What Is Not in Scope

- The content of agent instructions (these are prompts, not executable code)
- Accessibility advice accuracy (use the Agent Gap issue template for that)
