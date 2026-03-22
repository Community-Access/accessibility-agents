---
name: setup-web-cicd
description: Set up CI/CD pipeline for automated web accessibility scanning with axe-core, SARIF output, baseline management, and PR annotations.
mode: agent
tools:
  - askQuestions
  - runInTerminal
  - readFile
  - editFiles
  - createFile
---

# Set Up Web Accessibility CI/CD Pipeline

Configure automated web accessibility scanning for your repository's web content.

## Instructions

1. Ask which CI/CD platform to target:
   - **GitHub Actions** (recommended — includes SARIF for code scanning tab)
   - **Azure DevOps Pipelines**
   - **GitLab CI**
   - **Generic CI** (shell script for any runner)

2. Ask which scanning tool to use:
   - **axe-core CLI** (`@axe-core/cli`) — fast, reliable, WCAG 2.2 coverage
   - **Playwright + axe-core** — for SPAs, authenticated pages, or dynamic content
   - **Lighthouse CI** — includes performance and SEO alongside accessibility

3. Ask about gating strategy:
   - **Strict** — fail PR on any new violation (critical, serious, moderate, minor)
   - **Standard** — fail PR on critical or serious violations only (recommended)
   - **Baseline** — fail only when violation count increases from baseline (best for brownfield adoption)

4. Ask about baseline management:
   - Create `axe-baseline.json` to snapshot current violations
   - CI then fails only on *regressions* — new violations in the current PR
   - Allows gradual remediation without blocking all development

5. Ask about output and notifications:
   - **SARIF** — upload to GitHub code scanning for inline annotations
   - **PR comment** — post summary with pass/fail, issue counts, and links
   - **Build artifact** — save full report as downloadable artifact
   - **Slack/Teams webhook** — notify channel on failures

6. Generate the pipeline configuration with:
   - axe-core scan targeting WCAG 2.2 AA tags
   - HTML file discovery from changed files in the PR
   - Baseline comparison when a baseline file exists
   - SARIF output for GitHub code scanning integration
   - Clear pass/fail verdict in job summary

7. Generate a README section explaining the pipeline for the team.
