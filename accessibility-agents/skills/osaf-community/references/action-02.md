# Community action 2: Respond constructively to accessibility reports

Part of the `osaf-community` skill. Read this when action 2 is in scope.

- ID: `respond-constructively-to-accessibility-reports`
- Effort and cadence: Moderate; Ongoing
- Canonical source: [Community phase, action 2](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/community-phase.md#2-respond-constructively-to-accessibility-reports)

## Why it matters

This action builds trust with users and contributors; how a project responds to
accessibility reports can determine whether people continue using or
contributing to it.

## Definition of Done

1. Best practices on how to respond are documented in your `ACCESSIBILITY.md`.
2. Accessibility reports receive a respectful acknowledgement, status, and next
   step response.
3. Resolution outcomes are documented and, when possible, accessibility fixes
   get validated with affected users.

## Recommended steps, adapted from the framework

1. In `ACCESSIBILITY.md`, document respectful and constructive guidance on how
   to respond, using the toolkit's
   [how we respond example](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md#how-we-respond).
2. When needed, ask clarifying questions without dismissing or challenging the
   reporter's experience.
3. When practical, invite the reporter or another impacted user to validate the
   proposed fix.
4. Document the outcome and next steps before closing the issue.

## How to do it in this repository

- **Item 1 extends Workflow action 3.** If `ACCESSIBILITY.md` already has a "How
  we respond" section, add what is missing from the list below; if not, write
  it. One section, not two.
- **Items 2 and 3 are practice.** Look at recent issues labeled for
  accessibility: did each get an acknowledgement, a status and a next step? Was
  the outcome written down before it closed? Report the pattern with issue
  numbers; it is evidence, not blame.
- **Draft replies, do not post them.** For open reports with no response, draft
  an acknowledgement for the maintainer to approve. A good reply thanks the
  reporter, restates the barrier in their terms, gives the severity and status,
  offers a workaround if there is one, says what happens next, and never asks
  for a diagnosis.
- **Clarifying questions** ask about the environment and steps, never whether
  the barrier is real.

## Hand-offs

- `issue-tracker` - find reports without a response, and post approved replies;
  it can keep reusable response templates in the user's preferences file.
- `contributions-hub` - tone check on the drafts; it flags replies that read as
  dismissive.

## Example: response guidance for ACCESSIBILITY.md

The toolkit's "How we respond", punctuation converted to ASCII.

```markdown
### How we respond

- We will acknowledge the reporter's experience promptly, respectfully, and
  constructively, treating accessibility reports as valuable project expertise
  rather than complaints.
- We will not require reporters to disclose a diagnosis or other personal
  information.
- We will explain next steps, known limitations, and relevant dependencies.
- Where possible, we will provide a workaround while a fix is in progress.
- We will provide updates when the status or expected timeline changes (for
  example, "We're working on this - tracking in #123").
- We may ask the reporter to confirm that a fix resolves the barrier before
  closing the issue.
- We will thank the reporter for helping improve the project.
```

## Evidence to report

- The section and lines in `ACCESSIBILITY.md`.
- Recent reports, each with whether it got acknowledgement, status, next step
  and a documented outcome.
- Draft replies awaiting approval, with their issue numbers.
