# Accessibility Agents Extensions

Accessibility Agents extensions let a team add its own accessibility standards without forking the core project.

The goal is simple: Accessibility Agents should know the public standards, the built-in Community Access agent teams, and the local rules that matter in a real organization. A company may need design-system checks, procurement language, product terminology, regional requirements, or internal severity rules. Extensions give those rules a first-class place to live.

## Why Extensions Exist

Accessibility work is not one-size-fits-all.

WCAG, EN 301 549, PDF/UA, EPUB Accessibility, ARIA, and platform accessibility APIs are the baseline. They are not the whole picture. Many teams also have:

- internal component standards
- approved design-system patterns
- product-specific language rules
- region-specific compliance requirements
- industry requirements for health care, education, finance, or government
- test evidence requirements for procurement or legal review
- custom scanners or scripts
- company-specific remediation guidance

Before extensions, teams had two bad choices:

- fork Accessibility Agents and maintain a private copy
- paste company rules into every session and hope the model keeps them in context

Extensions avoid both. The core project stays upstream-compatible, while local standards can install beside it.

## Built-In Extensions

Accessibility Agents uses the same extension model internally.

The built-in packs are installed automatically by the universal installer. They are first-party Community Access extensions, not separate manual add-ons:

- `core` - orchestration, WCAG education, testing guidance, and cross-cutting governance
- `web` - ARIA, keyboard, forms, contrast, modals, live regions, links, tables, media, and components
- `documents` - Office, PDF, EPUB, remediation, inventories, and document reports
- `markdown` - markdown scanning, fixing, reporting, and accessible documentation workflows
- `github` - PRs, issues, Actions, releases, projects, repositories, security, notifications, and wiki workflows
- `developer-tools` - Python, wxPython, desktop accessibility APIs, NVDA add-ons, scanner tooling, and CI accessibility

The built-in packs use `Community Access` as the author.

This matters because third-party and company extensions use the same basic shape. The built-in NVDA, wxPython, markdown, GitHub, document, and web packs are both product functionality and examples for extension authors.

## How Installation Works

Users should not need extra steps after running the universal installer.

When Codex support is selected, the installer copies:

- the native Codex plugin
- five small router skills
- Codex custom subagents
- specialist reference files
- built-in extension manifests

The installer also records managed files so repair and uninstall flows can clean up safely.

For Codex, the important installed surfaces are:

- `~/.codex/plugins/a11y-agents-codex/` or project-local plugin scope
- `~/.codex/skills/` or project-local skill scope for router skills
- `~/.codex/agents/` or project-local agent scope for custom subagents
- `~/.a11y-agents/extensions/` or project-local `.a11y-agents/extensions/` for extension manifests

Exact paths can vary by platform and installer mode, but the user experience should not. Running the universal installer is the supported setup path.

## How Routing Works

Extensions are discovered from manifests. A router skill or coordinator checks:

- task domain
- file types
- trigger words
- compliance profiles
- extension metadata
- available specialist agents

When a match is found, extension agents can be included beside built-in agents. For example:

- a React design-system extension can join a web accessibility review
- an internal procurement extension can join a VPAT or accessibility statement task
- a company documentation extension can join a markdown or document scan
- a desktop product extension can join wxPython, NVDA, or desktop API work

Extension findings should be labeled by extension name. Public-standard findings and company-specific findings must remain distinguishable.

## Extension Manifest

```json
{
  "name": "acme-accessibility-standards",
  "displayName": "ACME Accessibility Standards",
  "version": "1.0.0",
  "description": "ACME-specific accessibility rules for design-system components and regulated workflows.",
  "author": "ACME Accessibility Team",
  "domains": ["web", "documents"],
  "extensionPoints": ["agents", "references", "rules", "complianceProfiles"],
  "complianceProfiles": ["wcag-2.2-aa", "acme-internal"],
  "agents": [
    {
      "name": "acme-design-system-auditor",
      "domains": ["web"],
      "triggers": ["acme", "design system", "tokens", "internal standards"],
      "path": "agents/acme-design-system-auditor.toml",
      "reference": "references/acme-design-system-auditor.md"
    }
  ]
}
```

### Required Fields

`name`
: Stable machine-readable extension id. Use lowercase letters, numbers, and hyphens.

`displayName`
: Human-readable name shown in docs, marketplaces, and install output.

`version`
: Extension version. Use semantic versioning when possible.

`description`
: Short explanation of what the extension adds and when it should be used.

`author`
: Plain text author name. Built-in Community Access extensions use `Community Access`.

`domains`
: Routing domains, such as `web`, `documents`, `markdown`, `github`, `developer-tools`, `desktop`, or a company-specific domain.

`extensionPoints`
: What the extension contributes. Common values are `agents`, `references`, `rules`, `complianceProfiles`, `prompts`, and `tools`.

### Optional Fields

`complianceProfiles`
: Public or private profiles the extension supports, such as `wcag-2.2-aa`, `en-301-549`, `pdf-ua`, or `acme-internal`.

`agents`
: Specialist agents supplied by the extension.

`references`
: Long-form guidance files that can be lazy-loaded only when needed.

`rules`
: Machine-readable rules, checks, policy ids, or scanner mappings.

`repository`
: Optional GitHub repository for a public extension.

`visibility`
: `public`, `private`, or `internal`. Public marketplace submissions should use `public`.

`status`
: Marketplace or lifecycle status, such as `built-in`, `submitted`, `reviewed`, `experimental`, or `deprecated`.

## Agent Entries

Agent entries point to platform-specific files or references. For Codex, agent files are TOML files that can be installed into `.codex/agents/`.

```json
{
  "name": "acme-design-system-auditor",
  "domains": ["web"],
  "triggers": ["acme", "design system", "button", "modal"],
  "path": "agents/acme-design-system-auditor.toml",
  "reference": "references/acme-design-system-auditor.md"
}
```

Use triggers for words, file patterns, component names, or standards language that should cause the router to consider the agent.

## Minimal Directory Layout

```text
my-extension/
  extension.json
  agents/
    acme-design-system-auditor.toml
  references/
    acme-design-system-auditor.md
  rules/
    acme-components.json
  README.md
```

Small extensions can start with only `extension.json` and one reference file. Larger extensions can add platform-specific agent files, scanner rules, tests, and docs.

## Writing Good Extension Guidance

Extension instructions should be precise enough for an agent to act on them and clear enough for a reviewer to understand them.

Good extension guidance:

- says when the extension applies
- separates public accessibility standards from company policy
- gives examples of passing and failing patterns
- includes severity guidance
- names the files, frameworks, or components it covers
- explains what evidence the agent should collect
- says when the agent should report instead of modifying files

Avoid vague guidance such as "make this accessible" or "follow our standards" without defining the standard.

## Company-Specific Rules

Company rules are allowed, but they must be labeled.

For example:

- `WCAG 2.2 AA failure: missing accessible name`
- `ACME policy warning: use the approved PrimaryButton component`

Do not present company policy as if it were WCAG unless it directly maps to a WCAG success criterion. If a company policy is stricter than WCAG, say that explicitly.

## Marketplace Submission Flow

Public extensions are listed in the Accessibility Agents Extension Marketplace.

The expected flow is:

1. Create an extension folder.
2. Add `extension.json`.
3. Add agent, reference, rule, or documentation files.
4. Add a marketplace entry to `marketplace.json`.
5. Open a pull request against the marketplace repository.
6. Automated checks validate manifest shape, names, paths, links, and content rules.
7. Community Access reviewers check quality, safety, scope, and labeling.
8. After merge, the website reads the updated marketplace registry.

The marketplace website is data-driven. It fetches the public registry and renders filters, extension detail views, manifest links, and optional GitHub repository links.

## Review Expectations

Marketplace review exists to protect users and the project.

Community Access will try to review extension pull requests as quickly as reasonably possible. Review speed depends on extension size, risk, clarity, and reviewer availability. Clear documentation helps reviewers understand the extension and move faster.

Some rules are mandatory:

- no malware
- no spam
- no deceptive behavior
- no hidden secret collection
- no instructions that tell agents to ignore user, system, platform, or safety instructions

Malware and spam are not tolerated. This includes credential theft, token theft, destructive commands, unauthorized exfiltration, suspicious binaries, obfuscated behavior, duplicate promotional submissions, affiliate spam, keyword-stuffed manifests, or unrelated product advertising.

Extensions must be honest about what they do. Do not claim WCAG coverage the extension does not provide, present company policy as public law, impersonate another organization, or hide external services and required tools.

Document the extension well enough that reviewers can help. A good submission explains what problem the extension solves, when it applies, what standards or policies it enforces, whether each rule is public or company-specific, what files or frameworks it expects, and what agents or references it adds.

Reviewers should check:

- the extension has a clear purpose
- author metadata is present
- descriptions explain when to use the extension
- rules are not misleadingly labeled as public standards
- instructions do not ask agents to exfiltrate secrets or private data
- generated output follows the repository no-emoji policy
- paths in the manifest exist
- public links are relevant and safe
- extension behavior is scoped to the stated domains

Review does not mean Community Access owns the extension. It means the extension meets the marketplace quality and safety bar at the time of review.

## Private Extensions

Not every extension belongs in the public marketplace.

Teams can keep private extensions for:

- internal product standards
- customer-specific workflows
- private component libraries
- security-sensitive test procedures
- non-public compliance mappings

Private extensions should use the same manifest format so they can be installed and discovered in the same way as public ones.

## Platform Mapping

Extensions use one manifest model, then each platform maps it into the platform's native surface:

- Claude Code: agents or specialists under the Claude plugin or `.claude/` structure
- GitHub Copilot: `skills/`, `skills/`, prompts, and instructions
- Codex: plugin references, router skills, and `.codex/agents/` custom subagents
- Gemini: Gemini extension files and instruction surfaces

The extension manifest is the common contract. Platform files are implementation details.

## Codex Behavior

Codex has a practical context-management problem: if every specialist is exposed as a top-level skill, Codex can hit skill-description limits and warn that skill context has been shortened.

Accessibility Agents v6 avoids that by using:

- a small set of router skills
- custom subagents for specialist work
- lazy-loaded reference files
- extension manifests for discovery

The router skill stays visible. Specialist details are loaded only when they are relevant. This keeps Codex aware of the Accessibility Agents system without forcing all specialist instructions into the initial context.

## Reporting Rules

Core WCAG findings and extension findings should both be visible.

When an extension rule contributes a finding:

- label the extension name
- identify whether the rule is company-specific or maps to a public standard
- avoid hiding conflicting core WCAG guidance
- report conflicts explicitly so the user can choose the governing policy
- include file references and evidence when possible

## Troubleshooting

If an extension is not being used:

1. Confirm the extension was installed by the universal installer or placed in a supported extension directory.
2. Confirm `extension.json` is valid JSON.
3. Confirm `name`, `displayName`, `version`, `description`, `author`, `domains`, and `extensionPoints` are present.
4. Confirm agent paths and reference paths are relative to the extension directory.
5. Confirm triggers or domains match the task.
6. Start a new Codex session after installing or updating Codex subagents.
7. Ask the agent to include installed extensions in the dispatch plan.

If a public marketplace extension does not appear on the website immediately after merge, wait for GitHub raw content and GitHub Pages caches to refresh. The website uses cache-busting fetches, but upstream edge caches can still take a short time to reflect newly pushed data.

## User Prompt Examples

Ask for extension-aware work directly:

```text
Review this branch for accessibility issues. Include installed Accessibility Agents extensions and label any extension-specific findings separately from WCAG findings.
```

```text
Audit these markdown docs using the built-in markdown extension and any installed company documentation extensions.
```

```text
Use Codex subagents for ARIA, keyboard, forms, contrast, and any matching installed design-system extension. Wait for all findings, then summarize by severity.
```

```text
Check this wxPython app with the developer tools extension, including desktop accessibility APIs and NVDA add-on guidance where relevant.
```

## Maintainer Checklist

Before releasing extension changes:

- run `node scripts/validate-skills/.js`
- run `node scripts/validate-agents.js --strict --validate-wcag --validate-urls --skip-url-checks`
- run `node scripts/check-skill-description-quality.js`
- run `bash -n scripts/install.mjs`
- run PowerShell syntax checks when `pwsh` is available
- run Go tests when `go` is available
- verify the universal installer still installs built-in extension manifests
- verify new documentation contains no emoji

Extensions should make Accessibility Agents more adaptable without making installation or routing harder for users.
