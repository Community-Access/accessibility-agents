# Community action 1: Invite community help on accessibility work

Part of the `osaf-community` skill. Read this when action 1 is in scope.

- ID: `invite-community-help-on-accessibility-work`
- Effort and cadence: Extended; Ongoing
- Canonical source: [Community phase, action 1](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/community-phase.md#1-invite-community-help-on-accessibility-work)

## Why it matters

Involving people with disabilities early brings lived experience that tools and
specifications cannot reproduce, while practitioners and experienced testers
contribute complementary technical expertise. Together, these perspectives help
projects make better decisions throughout development instead of evaluating
accessibility only after the work is complete.

## Definition of Done

1. Community-contribution opportunities are publicly available.
2. Issues include scope, context, and acceptance criteria.
3. Contributors can access guidance and maintainer support.
4. The project maintains an ongoing feedback or advisory practice.

## Recommended steps, adapted from the framework

1. Identify accessibility tasks that can be completed by community
   contributors.
2. Create clearly scoped issues with context, acceptance criteria, and
   appropriate labels such as `accessibility` with `good first issue` for
   beginner-friendly work and `accessibility` with `help wanted` where projects
   are actively seeking support.
3. Invite participation through office hours, group channels, or community
   discussions.
4. Provide contributors with a way to ask questions and receive feedback.
5. Validate fixes with affected users when possible.
6. Maintain a lightweight advisory or feedback loop.

## How to do it in this repository

- **Items 1 and 2 build on Workflow actions 5 and 6.** If those labels and
  issues exist, cite them; if not, do them first (`osaf-workflow`) or in the
  same pass.
- **Make the opportunities findable.** A short "How to help" paragraph in
  `ACCESSIBILITY.md` or `CONTRIBUTING.md` that links the label searches, for
  example `issues?q=is:open label:accessibility label:"good first issue"`.
  Include work that is not code: testing with assistive technology,
  reproducing reports, reviewing docs, design feedback.
- **Guidance and support (item 3).** Name where questions go (a discussion
  category, a chat channel, office hours) and who answers. That is maintainer
  input; never invent a channel or a schedule.
- **An advisory practice (item 4)** can be small: a standing discussion thread
  for accessibility feedback, a periodic call, or a list of users who have
  agreed to test fixes. Record what the maintainer chooses and how often it
  runs. It is ongoing; report it as recurring work.
- **Validating fixes with affected users** needs their consent each time; the
  reporter is the natural first person to ask (Community action 2).

## Hand-offs

- `issue-tracker` - write the scope, context and acceptance criteria into the
  selected issues, and apply labels, once approved.
- `contributions-hub` - create or categorize a discussion for accessibility
  feedback, check `good first issue` and `help wanted` hygiene, and draft
  welcomes for first-time contributors.
- `repo-manager` - generate starter issues when there are none.

## Evidence to report

- The public links to the opportunities (label searches, discussion).
- The issues with acceptance criteria.
- The support channel and the advisory practice, or that the maintainer still
  has to choose them.
