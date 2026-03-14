---
name: manage-repository
description: Repository setup and management specialist. Scaffolds issue templates, contributing guides, CI workflows, releases, labels, badges, licenses, and open source best practices.
mode: agent
agent: repo-manager
tools:
  - askQuestions
  - readFile
  - createFile
  - runInTerminal
  - getTerminalOutput
---

# Repository Manager

GitHub repository setup and management specialist. Scaffold community health files, CI workflows, release process, and open source best practices.

## Repository

**Repository:** `${input:repo}`

## What to Set Up?

**Action:** `${input:action}` (issue-templates, contributing, ci, release, labels, badges, license, readme, all)

## Instructions

### Setup Issue Templates

Create `.github/ISSUE_TEMPLATE/`:

- `bug_report.yml` - Bug report form
- `feature_request.yml` - Feature request form
- `accessibility_issue.yml` - Accessibility-specific template
- `config.yml` - Template chooser configuration

Use `template-builder` agent to generate each template interactively.

### Setup Contributing Guide

Create `CONTRIBUTING.md`:

```markdown
# Contributing to ${projectName}

Thank you for your interest in contributing!

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/{you}/${repo}.git`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make changes and commit
5. Push and open a pull request

## Development Setup

\`\`\`bash
npm install
npm run dev
npm test
\`\`\`

## Pull Request Process

1. Update README if adding features
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Coding Standards

- Follow existing code style
- Run linter: `npm run lint`
- Write descriptive commit messages

## Accessibility Requirements

All UI changes must meet WCAG 2.1 AA standards:
- Test with screen readers (NVDA/VoiceOver)
- Verify keyboard navigation
- Run axe-core DevTools scan
```

### Setup Code of Conduct

Create `CODE_OF_CONDUCT.md`:

Use Contributor Covenant:

```bash
curl -o CODE_OF_CONDUCT.md https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md
```

### Setup CI Workflows

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx @axe-core/cli http://localhost:3000 --tags wcag2a,wcag2aa
```

### Setup Release Process

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

Also create `CHANGELOG.md` following Keep a Changelog format.

### Setup Labels

Create standard label set:

```bash
# Priority labels
gh label create --repo ${input:repo} "priority: critical" --color d73a4a
gh label create --repo ${input:repo} "priority: high" --color e99695
gh label create --repo ${input:repo} "priority: medium" --color f9d0c4
gh label create --repo ${input:repo} "priority: low" --color fef2c0

# Type labels
gh label create --repo ${input:repo} "type: bug" --color d73a4a
gh label create --repo ${input:repo} "type: feature" --color 0e8a16
gh label create --repo ${input:repo} "type: documentation" --color 0075ca
gh label create --repo ${input:repo} "type: accessibility" --color 7057ff

# Status labels
gh label create --repo ${input:repo} "status: needs-triage" --color ededed
gh label create --repo ${input:repo} "status: in-progress" --color fbca04
gh label create --repo ${input:repo} "status: blocked" --color b60205
```

### Setup README Badges

Add badges to `README.md`:

```markdown
# Project Name

[![CI](https://github.com/${owner}/${repo}/workflows/CI/badge.svg)](https://github.com/${owner}/${repo}/actions)
[![License](https://img.shields.io/github/license/${owner}/${repo})](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
```

### Setup License

Ask for license choice:

- MIT (permissive)
- Apache 2.0 (permissive with patent grant)
- GPL-3.0 (copyleft)
- BSD-3-Clause (permissive)

Generate `LICENSE` file via GitHub API:

```bash
gh api repos/${input:repo}/license --method PUT -f license=mit
```

### Setup Security

Create `SECURITY.md`:

```markdown
# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to security@example.com.

Do not open public issues for security vulnerabilities.

We will respond within 48 hours.
```

## Expected Output

- Issue templates created
- CONTRIBUTING.md, CODE_OF_CONDUCT.md added
- CI workflows configured
- Labels created
- README badges added
- License file added
- Security policy added
- Repository ready for open source contributions
