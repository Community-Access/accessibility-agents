# ci-accessibility — CI/CD Accessibility Pipeline Manager

> Sets up, manages, and troubleshoots automated accessibility scanning in CI/CD pipelines across multiple platforms.

## Features

- Supports GitHub Actions, Azure DevOps, GitLab CI, CircleCI, and Jenkins
- Baseline management: fail only on new regressions, not pre-existing issues
- SARIF output for GitHub Code Scanning integration
- PR annotations with inline accessibility findings
- Configurable severity thresholds (block on critical/serious, warn on moderate/minor)
- axe-core CLI configuration with WCAG 2.x tag filtering
- Multi-page scan orchestration for comprehensive coverage
- Pipeline template generation for each supported CI platform

## When to Use It

- Setting up accessibility scanning in a new or existing CI pipeline
- Troubleshooting why accessibility checks are failing or not running
- Configuring baseline files to avoid blocking on legacy issues
- Adding PR annotations so developers see accessibility issues inline
- Tuning severity thresholds to balance strictness with developer velocity
- Generating SARIF reports for GitHub Advanced Security integration

## How It Works

1. **Detection** — Identifies the CI platform from config files in the repository
2. **Configuration** — Generates or updates pipeline config with axe-core scanning steps
3. **Baseline setup** — Creates a baseline snapshot of existing issues so only regressions fail the build
4. **Threshold tuning** — Configures which severity levels block merges versus produce warnings
5. **Output formatting** — Sets up SARIF, JUnit, or JSON output based on platform capabilities
6. **Validation** — Runs a dry-run scan to confirm the pipeline works before committing

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When a full audit identifies the need for CI enforcement |
| Receives from | pr-review | When PR checks need automated accessibility gates |
| Hands off to | accessibility-lead | When scan results require a full manual audit |
| Hands off to | pr-review | When PR-specific review context is needed beyond automated scanning |
| Hands off to | testing-coach | When teams need guidance on complementing CI scans with manual testing |

## Sample Usage

```text
@ci-accessibility Set up GitHub Actions accessibility scanning for this repository with SARIF output

@ci-accessibility Add a baseline file so we only fail on new accessibility regressions

@ci-accessibility Why is the axe-core scan timing out in our Azure DevOps pipeline?

@ci-accessibility Configure PR annotations for accessibility findings in GitLab CI
```

## Related

- [accessibility-lead](./accessibility-lead.md) — Coordinates full accessibility audits that CI scanning feeds into
- [pr-review](./pr-review.md) — Reviews PRs with accessibility focus, consumes CI scan results
- [testing-coach](./testing-coach.md) — Guides manual testing strategy to complement automated CI scans
