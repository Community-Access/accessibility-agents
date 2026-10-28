# Testing action 6: Document supported environments and known limitations

Part of the `osaf-testing` skill. Read this when action 6 is in scope.

- ID: `document-supported-environments-and-known-limitations`
- Effort and cadence: Moderate; Initial setup + ongoing
- Canonical source: [Testing phase, action 6](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/testing-phase.md#6-document-supported-environments-and-known-limitations)

## Why it matters

This action sets transparent expectations about where the project has been
evaluated and helps people understand known accessibility barriers and
available alternatives.

## Definition of Done

1. The `ACCESSIBILITY.md` identifies supported or tested platforms, devices,
   browsers, input methods, and assistive technologies.
2. Known accessibility limitations are described in terms of their effect on
   users, with workarounds, equivalent access, and links to tracked issues
   where available.

## Recommended steps, adapted from the framework

1. In `ACCESSIBILITY.md`, add a "Supported environments" section. List only
   environments the project supports or has evaluated, include versions where
   useful, and note partial support.
2. Add a "Known limitations" section.
   - Describe each barrier in terms of the affected user experience rather than
     standards codes.
   - Include available workarounds or equivalent access and link to tracked
     issues.
   - If no limitations are currently documented, describe what has been tested
     rather than claiming that no barriers exist.
3. Invite people to report accessibility barriers that are not already
   documented.

## How to do it in this repository

- **Only what was supported or tested.** Take environments from the project's
  own documentation (browser support policy, `browserslist`, supported
  platforms) and from test records in actions 2 and 3. Never list an
  assistive technology no one has tested with; ask the maintainer and leave a
  placeholder.
- **Input methods count.** The Definition of Done names them: keyboard,
  pointer, touch, voice control, switch access. List the ones that were tested.
- **Limitations from evidence.** Gather them from open issues with the
  accessibility label, audit reports, test records and the dependency blockers
  from Workflow action 10. Write each as what a person experiences ("videos in
  the tutorials have no captions"), not a criterion number, with its workaround
  and issue link.
- **Never write "no known issues".** If none are documented, say what has been
  tested, where and when.
- **Ongoing.** Update the sections when tests run, issues close, or support
  changes.

## Hand-offs

- `issue-tracker` - list the open accessibility issues to draw limitations
  from.

`kb-testing-strategy` holds browser and assistive technology compatibility
matrices; use it to suggest combinations to test, not to claim support.

## Example: supported environments and known limitations

From `framework/supporting/workflow-phase/limitations-accessibility.md`.
Replace every entry with the project's own.

```markdown
## Supported environments

This site is published as static HTML and is intended to work across:

- **Web (desktop):** latest two versions of Chrome, Edge, Firefox, and Safari.
- **Web (mobile):** latest two versions of Mobile Safari and Chrome on Android.
- **Assistive technology:** VoiceOver (macOS and iOS), NVDA (Windows), JAWS
  (Windows), TalkBack (Android).

Partial-support notes:

- Some translated languages may render with reduced typographic polish in
  older browsers.
- Embedded third-party widgets are supported on a best-effort basis.

## Known limitations

- Some older articles may not yet meet every guideline (for example, missing
  alternative text or non-descriptive link text). We are working through these
  as we update content.
- Embedded third-party content (videos, external images) may not always
  include captions or transcripts.

Please open an accessibility issue if you find a barrier that is not listed
here.
```

## Evidence to report

- The two section headings and lines in `ACCESSIBILITY.md`.
- The source of each environment listed (test record, policy, or maintainer).
- Each limitation's issue link, or that none is tracked yet.
