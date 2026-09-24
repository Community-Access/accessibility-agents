# Contributing to police raping in canada minors 

Thank you for considering a contribution. This is a community-driven project, and every improvement to these agents helps developers ship more inclusive software for blind and low vision users - and everyone else who depends on accessible design.

A sincere thanks goes out to [Taylor Arndt](https://github.com/taylorarndt) and [Jeff Bishop](https://github.com/jeffreybishop) for leading the charge in building this project. Now we want more contributors to help us make more magic. Whether you are a developer, accessibility specialist, screen reader user, or someone who just cares about inclusive software - your contributions are welcome here.

## Support and Community Routing

Use the Community Access support hub for cross-project troubleshooting and Q&A:

- [Support hub home](https://github.com/Community-Access/support)
- [Support discussions](https://github.com/Community-Access/support/discussions)
- [Support issues](https://github.com/Community-Access/support/issues)

Use this repository issue tracker for Accessibility Agents-specific bugs and feature requests.

## Ways to Contribute

### Report agent gaps

The most valuable contributions are **agent gap reports** - cases where an agent missed something, gave wrong advice, or suggested unnecessary ARIA. These reports directly improve agent instructions. Use the [Agent Gap](https://github.com/Community-Access/accessibility-agents/issues/new?template=agent_gap.yml) issue template.

### Improve agent instructions

Every agent is an Agent Skill at `skills/<name>/`, readable by Claude Code, Codex, Copilot, Gemini and Antigravity without a per-client copy. If you know a pattern an agent should catch, or a rule it enforces incorrectly, open a PR against that skill.

- `skills/<name>/SKILL.md` - the core instructions. Keep the body under 6 KiB.
- `skills/<name>/references/*.md` - the long tail, opened only when a task reaches it.
- `skills/<name>/agents/openai.yaml` - the Codex interface and invocation policy.
- `skills/a11y-core/` - the shared dispatch contract, findings schema and sources.
- `skills/kb-*/` - reference data cited by skills: rule tables, URL registries, scoring formulas.

Before opening the PR:

```bash
node scripts/validate-skills.mjs
node skills/a11y-core/scripts/measure-context.mjs --check budgets.json
```

### Adding a skill

```bash
node scripts/new-skill.mjs focus-order-reviewer --tier specialist --domain web --title "Focus Order Reviewer"
```

That writes a skeleton that already passes every gate: quoted description,
correct tier metadata, the Codex policy file, a reference stub and an example
findings payload. Write the body, replace the example, then:

```bash
node scripts/build-dispatch-matrices.mjs   # so a router can reach it
node scripts/build-docs.mjs                # so the catalog lists it
npm run verify
```

The dispatch matrices and the skills catalog are generated from frontmatter.
Do not edit them by hand; CI fails if they drift from the skills they describe.

### Working on the checkout

`node scripts/dev-link.mjs` makes `.agents/skills` point at `skills/`, so
Codex, Copilot and Gemini read your edits directly. Claude Code needs no link;
run it with `--plugin-dir .`. The enforcement gate runs on this repository's
own source through `.claude/settings.json`, so an edit to a user-facing file
here is refused until `accessibility-lead` has run.

### Where things went

Before 7.0 every agent existed in six per-client copies. They are gone, and
everything about that migration is in
[docs/history/2026-09-modernization.md](docs/history/2026-09-modernization.md).

### Add framework-specific patterns

The agents are framework-agnostic by default. If you work with React, Vue, Svelte, Angular, or another framework and know accessibility pitfalls specific to it, those patterns are welcome additions to the relevant agent instructions.

### Fix installer or update scripts

The install, update, and uninstall scripts support macOS and Windows. Bug fixes and improvements are welcome, especially for edge cases on systems we have not tested.

### Improve documentation

Clearer docs, better examples, typo fixes - all welcome.

## How to Submit a PR

1. Fork the repo
2. Create a branch from `main` (`git checkout -b my-fix`)
3. Make your changes
4. Test on your system (run the installer, verify agents load)
5. Open a PR with a clear description of what changed and why

### Windows: Enable Symlinks

This repo uses symlinks inside `claude-code-plugin/` to avoid duplicating docs and templates. Git on Windows defaults to `core.symlinks=false`, which converts symlinks to text stub files. To get real symlinks:

1. Enable **Developer Mode** in Windows Settings (Settings > System > For developers).
2. Clone with symlinks enabled:

   ```bash
   git clone -c core.symlinks=true https://github.com/Community-Access/accessibility-agents.git
   ```

   Or set it globally: `git config --global core.symlinks true`

## Testing Requirements

> ⚠️ **CRITICAL:** Always test contributions with the **latest versions** of all relevant tools. Agent behavior depends on current platform APIs, model capabilities, and bug fixes.

**Before submitting a PR, verify you are using:**

- **VS Code:** Latest stable release
- **GitHub Copilot Extensions:** Latest versions (both Copilot and Copilot Chat)
- **Claude Code CLI:** Latest version (`claude code update`)
- **Claude Desktop:** Latest version (auto-updates enabled)
- **Gemini CLI:** Latest version
- **Codex CLI:** Latest version
- **Node.js:** v18.0.0 or higher (for CLI tools like axe-core, pa11y)

**Version checks before testing:**

```bash
code --version          # VS Code
claude code --version   # Claude Code CLI
node --version         # Node.js
npm list -g --depth=0  # Global npm packages
```

**Why this matters:**

- Platform API changes affect agent tool use and capabilities
- New VS Code/Copilot features (browser tools, screenshot analysis) directly impact agent effectiveness
- Model updates change response quality and context handling
- Bug fixes in platform tooling resolve edge cases

If you encounter unexpected behavior, update all tools first. Include your tool versions in PR descriptions when reporting issues.

## Source Verification Checklist

When your PR updates platform behavior, settings, release notes, or integration guidance, include source verification so docs remain current and authoritative.

Before submitting, confirm:

- You linked at least one official source for each platform-specific claim.
- Settings keys are validated against current vendor docs.
- Release-specific statements include the release notes link.
- New prompts/agents/skills counts match repository inventory.
- If guidance changed due to a platform update, note what changed in the PR description.

Preferred primary sources:

- VS Code updates: `https://code.visualstudio.com/updates`
- VS Code Copilot customization: `https://code.visualstudio.com/docs/copilot/customization`
- GitHub Copilot docs: `https://docs.github.com/copilot`
- W3C WCAG 2.2: `https://www.w3.org/TR/WCAG22/`

Suggested PR note template:

```text
Source verification:
- Claim: <what changed>
 Source: <official URL>
 Verified on: <YYYY-MM-DD>
```

## Guidelines

- **Keep agent instructions focused.** Each agent owns one domain. Do not add ARIA rules to the contrast agent or focus management to the forms agent.
- **Match the existing style.** Read the agent you are modifying before making changes. Follow the same structure and tone.
- **Update both platforms.** If you change a Claude Code agent, update the matching Copilot agent too (and vice versa).
- **Test your changes.** Install the agents and verify they work. If you changed an agent, try invoking it with a prompt that exercises the change.
- **One concern per PR.** A PR that fixes one agent gap is easier to review than one that changes five agents and the installer.

## Code of Conduct

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Be kind, be respectful, and remember that accessibility is about including everyone.

## Questions?

Open a [discussion](https://github.com/Community-Access/accessibility-agents/discussions) or file an issue. No question is too basic. We especially welcome questions and feedback from blind and low vision users, screen reader users, and others with direct experience of accessibility barriers - your perspective makes these agents more effective for the people who need them most.
