# Foundational action 1: Create an ACCESSIBILITY.md

Part of the `osaf-foundational` skill. Read this when action 1 is in scope.

- ID: `create-an-accessibilitymd`
- Effort and cadence: Quick; One-time setup
- Canonical source: [Foundational phase, action 1](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/foundational-phase.md#1-create-an-accessibilitymd)

## Why it matters

This action gives users and contributors a clear place to find accessibility
information and report barriers.

## Definition of Done

1. An `ACCESSIBILITY.md` exists in the repository.
2. The file includes a brief statement describing why accessibility matters to
   your project.

## Recommended steps, adapted from the framework

1. Create an `ACCESSIBILITY.md` file in the repository.
2. Add a brief accessibility statement for your project, using the initial
   example below for guidance.
3. Commit the file and make it available in the default branch.

Mature projects can refer to the Accessibility Toolkit's comprehensive
[ACCESSIBILITY.md example](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md).
Its sections are listed in `kb-open-source-accessibility-framework`, under
"Where ACCESSIBILITY.md is built"; later phases add them one action at a time.

## How to do it in this repository

- **Look first.** Search for `ACCESSIBILITY.md` at the root, in `docs/` and in
  `.github/`, and for an accessibility section in the README or the docs site.
  If the project already has a statement under another name, propose an
  `ACCESSIBILITY.md` that holds it or links to it; the maintainer chooses.
- **Place it at the root** unless the project keeps its community files in
  `docs/` or `.github/`. The Definition of Done only needs it in the repository;
  the root is where people look.
- **Write the statement in the project's voice.** Say what the project is, that
  people with disabilities and people using assistive technology should be able
  to use it and contribute to it, and what the file covers. Use plain language,
  name the project rather than "this site" when it is not a site, and make no
  conformance claim. Why accessibility matters is the maintainer's statement to
  make: if the request does not say, draft one and mark it for their review.
- **Do not pre-create empty sections** for later phases. Each later action adds
  its own section with real content.
- **The default branch** is the maintainer's step. Report it as follow-up until
  the change is merged.
- **Not a conformance statement.** Do not hand off to `accessibility-statement`
  for this file; that skill writes W3C and EU model statements that declare a
  conformance status. Offer it only if the maintainer has an evaluation and
  wants a separate conformance statement.

## Hand-offs

- `markdown-a11y-assistant` (router) - audit the new file: one H1, no skipped
  levels, descriptive link text. Small file, so one scanner dispatch.

## Example: initial ACCESSIBILITY.md

From the framework's `framework/supporting/foundational-phase/initial-accessibility.md`,
punctuation converted to ASCII. The framework's guidance for this text: a brief
statement of why accessibility matters to the project, who should be able to
use and contribute to it, and what the document covers.

```markdown
# Accessibility

Accessibility is a core priority for our project. We want everyone - including
people with disabilities and people using assistive technology - to be able to
read, navigate, and contribute to this site.

This document will explain our accessibility commitment, how contributors can
help us uphold it, and how to report accessibility issues.
```

## Optional: the participation message

Once the project has a tracking issue, the framework offers this section for
the README or `ACCESSIBILITY.md`. Replace both placeholders with real URLs; never
publish it before the tracking issue exists. From
`framework/supporting/framework-participation-message.md`.

```markdown
## Accessibility

This project participates in the [Open Source Accessibility Framework](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework).

We are using the framework to make accessibility improvements visible, trackable,
and ongoing. Our accessibility goals, planned actions, progress, and remaining
barriers are documented in our [public framework tracking issue](TRACKING_ISSUE_URL).

This participation reflects a commitment to continuous improvement. It is not a
certification or a claim that the project is fully accessible. We welcome
feedback and accessibility bug reports from users and contributors. Please see
our [accessibility documentation](ACCESSIBILITY_DOC_URL) for supported
environments, known limitations, workarounds, and reporting instructions.
```

## Evidence to report

- The path of the file, and the line where the statement is.
- Whether the statement came from the maintainer or is a draft for review.
- Whether the file is on the default branch yet.
