# Accessibility Agents (directory edition)

WCAG 2.2 AA review inside Claude. Six router skills hand web, document,
Markdown, desktop and GitHub work to a team of accessibility specialists, each
of which cites the success criterion, the severity and the fix for every issue
it finds.

This is the edition the Claude plugin directory lists. It holds the skills,
and connects to the Accessibility Agents MCP server at
<https://letitglow.app/a11y/mcp> for checks that work on what you send them: color
contrast (WCAG and APCA), color blindness simulation, reading level,
component guidelines, and heading, link-text and form-label checks on HTML.

## What the hosted server receives

Only the arguments of a check you run: colors, a passage of text, or an HTML
snippet. It reads no files, fetches no addresses, keeps no history and needs
no account. The privacy policy is in [PRIVACY.md](PRIVACY.md).

## The full edition

The full edition adds an edit gate, hooks that stop Claude from changing
user-facing files until the accessibility review has run, and a local MCP
server that scans Office, PDF, ePub and Markdown files and runs axe against
pages on your own computer, so those files never leave it. Install it from
this repository's marketplace:

```bash
claude plugin marketplace add Community-Access/accessibility-agents
claude plugin install accessibility-agents@community-access
```

Source, documentation and issues: <https://github.com/Community-Access/accessibility-agents>.
