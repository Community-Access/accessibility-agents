# Accessibility Resources

Materials from Accessibility Agents' own accessibility work that other
projects can reuse. Each entry says what problem it solves, what you need to
use it, its limits, and when it does not apply. Everything here is in this
repository under the MIT license; the text adapted from the Open Source
Accessibility Framework and its toolkit is MIT too, with the notices in each
`osaf-*` skill's `references/LICENSE-OSAF.md`.

These resources are maintained by the project's accessibility owner (see
[Ownership and maintenance](../../ACCESSIBILITY.md#ownership-and-maintenance))
and reviewed in the monthly accessibility review. Report a problem in one of
them with the
[accessibility issue form](https://github.com/Community-Access/accessibility-agents/issues/new?template=accessibility.yml).

This page lists what the project uses on itself. The package's skills, which
help other projects with their own accessibility, are listed in the
[skills catalog](../reference/skills/README.md).

## Core-flow tests for a project with no graphical interface

[docs/accessibility/accessibility-testing.md](accessibility-testing.md)

- **Problem it solves:** the framework's keyboard, screen reader and manual
  checks are written for web pages. A command-line tool, a plugin or an MCP
  server has terminal output, editor commands and generated files instead.
  This page adapts each check to those interfaces, and keeps a record that
  separates what a person ran, what an agent ran, and what nobody has run.
- **To reuse it:** replace the list of interfaces and core flows with your
  own, keep the four check lists, and copy the record template.
- **Limits:** the keyboard checks cannot confirm visible focus without a
  person looking; an agent run is evidence of what a flow prints, not of how it
  is heard.
- **When it does not apply:** a web or desktop app with its own interface,
  which needs the framework's original checks in full.

## Markdown accessibility linter

[.github/scripts/markdown-a11y-lint.mjs](../../.github/scripts/markdown-a11y-lint.mjs)

- **Problem it solves:** documentation accessibility drifts one pull request
  at a time. The linter checks every Markdown file for one H1, skipped heading
  levels, missing or weak alternative text, vague link text, table shape and
  code block languages, and fails CI on errors.
- **To reuse it:** Node.js 22 or later; run
  `node markdown-a11y-lint.mjs <dir> --fail-on error` in CI. It has no
  dependencies outside Node.js.
- **Limits:** it reads the source, not the rendered page, and cannot judge
  whether alternative text or a heading is meaningful in context.
- **When it does not apply:** documentation written in another format, such as
  reStructuredText or AsciiDoc.

## Accessibility issue form

[.github/ISSUE_TEMPLATE/accessibility.yml](../../.github/ISSUE_TEMPLATE/accessibility.yml)

- **Problem it solves:** reporters do not know what to include, and a long
  form puts people off. This form requires only what happened and where,
  makes everything else optional, says partial reports are welcome and that no
  one needs to disclose a disability, offers email instead, and applies the
  `accessibility` label.
- **To reuse it:** copy it into `.github/ISSUE_TEMPLATE/`, change the client
  and environment choices, and pair it with a private email route in
  `config.yml`, as this repository does.
- **Limits:** GitHub issue forms need a GitHub account; the email route is the
  alternative.

## Pull request accessibility checklist

[.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md)

- **Problem it solves:** reviewers cannot see accessibility work they are not
  told about. The checklist groups the contributor expectations by kind of
  change (documentation, findings, interfaces, terminal and MCP output,
  dependencies, release) and asks for N/A where an item does not apply.
- **To reuse it:** keep the grouping, and replace the items with your own
  contributor expectations.
- **Limits:** a ticked box is a statement, not a test; review still matters.

## Monthly accessibility review workflow

[.github/workflows/accessibility-review.yml](../../.github/workflows/accessibility-review.yml)

- **Problem it solves:** recurring framework actions (responding to reports,
  keeping limitations current, publishing progress) slip without a prompt. On
  the first of each month this opens one public issue that invites feedback and
  lists the owner's review, and closes the previous month's issue.
- **To reuse it:** change the repository name in the `if:` condition and the
  links in the issue body. It needs `issues: write` and the `accessibility`
  label.
- **Limits:** it writes the reminder, not the review.

## The Open Source Accessibility Framework skills

`skills/osaf-foundational`, `skills/osaf-workflow`, `skills/osaf-testing`,
`skills/osaf-community` and `skills/kb-open-source-accessibility-framework`,
described in [docs/standards/osaf.md](../standards/osaf.md)

- **Problem it solves:** adopting the framework means reading 24 actions and
  their definitions of done, then mapping them onto a repository. These skills
  carry the definitions offline, inspect the repository first, refuse to claim
  a test that has no evidence, and prepare every public change for review.
  This project's own adoption was done with them.
- **To reuse them:** install this package in any supported client and ask it
  to "adopt the Open Source Accessibility Framework in this repo", or one
  phase or action.
- **Limits:** they prepare and draft; a maintainer still decides, posts and
  checks off the tracking issue.

## Records worth copying

- [The framework record](accessibility-framework.md): one row per action
  with status and evidence, plus a collaboration tools review, a response
  record, and the recognition and progress practices.
- [The progress page](accessibility-progress.md): the shape of a progress
  update, with lessons learned.
- The "Dependencies and upstream blockers" section of
  [ACCESSIBILITY.md](../../ACCESSIBILITY.md#dependencies-and-upstream-blockers),
  for a project whose users meet it through other people's tools.
