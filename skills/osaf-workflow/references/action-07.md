# Workflow action 7: Assign accessibility ownership

Part of the `osaf-workflow` skill. Read this when action 7 is in scope.

- ID: `assign-accessibility-ownership`
- Effort and cadence: Quick; Initial setup + ongoing
- Canonical source: [Workflow phase, action 7](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#7-assign-accessibility-ownership)

## Why it matters

This action prevents drift.

## Definition of Done

1. The `ACCESSIBILITY.md` identifies an accessibility owner.
2. Responsibilities are documented.

## Recommended steps, adapted from the framework

1. In `ACCESSIBILITY.md`, identify a maintainer for triaging accessibility work.
2. Document the responsibilities of the accessibility owner.

## How to do it in this repository

- **Never pick the owner.** Who owns accessibility is the maintainers'
  decision. Do not infer it from commit counts, `CODEOWNERS` or the issue
  history. Ask; until there is an answer, write the section with a marked
  placeholder and report item 1 as needing maintainer input.
- **A role is acceptable.** The framework's example allows "maintainer name or
  role", for example "the docs team" or a GitHub team handle. A named person
  should agree before their handle is published.
- **Ongoing.** The toolkit suggests stating the review cadence and how
  ownership transfers when responsibilities change. Add both if the maintainer
  can say.
- **`CODEOWNERS` is optional.** If the maintainer wants reviews of
  `ACCESSIBILITY.md` and the templates routed to the owner, offer a
  `CODEOWNERS` entry; it is not part of the Definition of Done.

## Hand-offs

None required. `team-manager` can create a GitHub team if the owner is a team
that does not exist yet.

## Example: ownership and maintenance

From `framework/supporting/workflow-phase/ownership-accessibility.md`.

```markdown
## Ownership and maintenance

Accessibility is owned by **[maintainer name or role]**.

### Responsibilities

The accessibility owner is responsible for:

- Triaging accessibility reports.
- Tracking accessibility work and known barriers.
- Sharing status updates and escalating unresolved accessibility risks to
  project maintainers.
- Keeping the project's accessibility documentation current.
```

## Evidence to report

- The section heading and line in `ACCESSIBILITY.md`.
- Whether the owner is confirmed by the maintainer or still a placeholder.
