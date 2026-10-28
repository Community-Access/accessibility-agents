# Community action 6: Share accessibility resources

Part of the `osaf-community` skill. Read this when action 6 is in scope.

- ID: `share-accessibility-resources`
- Effort and cadence: Moderate; Ongoing
- Canonical source: [Community phase, action 6](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/community-phase.md#6-share-accessibility-resources)

## Why it matters

Sharing accessibility resources, solutions, and lessons learned helps other
projects improve faster. Documenting both successes and failures enables
communities to build on proven practices and avoid repeating mistakes.

## Definition of Done

1. Useful accessibility resources are made publicly available.
2. Resources include enough context for another project to use them.
3. Ownership for maintaining the resources is identified.

## Recommended steps, adapted from the framework

1. Identify project materials that could help other teams, such as
   accessibility issue templates, pull request checklists, test procedures,
   accessible component examples, coding patterns, accessibility statements,
   meeting accessibility checklists, contributor guidance, usability-test
   tasks, community feedback templates, testing scripts, remediation examples,
   and lessons learned.
2. Review the materials to ensure they are clear, accessible, and easy to use.
   - Explain the problem each resource intends to solve.
   - Include prerequisites, limitations, known tradeoffs, and situations where
     the resource may not apply.
3. Publish them in a discoverable repository location or community channel.
   - Consider sharing your work in the
     [Open Source Accessibility community show-and-tell](https://github.com/orgs/open-source-accessibility/discussions/new?category=show-and-tell).
   - Review the toolkit's
     [sharing resources and solutions](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/resources/community/community.md#sharing-resources-and-solutions)
     guidance.
4. Keep shared resources current as standards, tools, and community practices
   evolve.

## How to do it in this repository

- **Earlier phases produced most of the candidates**: the issue form, the pull
  request checklist, the keyboard and screen reader test records, the triage
  section, the progress update template. List what exists.
- **Add the context** each one needs to be reused, in a short README beside it
  or a section in `docs/`: the problem it solves, prerequisites, limitations,
  tradeoffs, and where it does not apply.
- **Name an owner** for keeping them current: by default the accessibility
  owner from Workflow action 7, if the maintainer agrees.
- **Publishing outside the repository** (a show-and-tell post, a wiki page) is
  a public change; draft it for approval.

## Hand-offs

- `markdown-a11y-assistant` (router) - audit the shared documents, so the
  resources meet the standard they teach.
- `wiki-manager` - publish them as wiki pages if the project uses its wiki.
- `contributions-hub` - draft a discussion post that announces them.

## Evidence to report

- Each resource, its public location, and the context written for it.
- The owner named.
