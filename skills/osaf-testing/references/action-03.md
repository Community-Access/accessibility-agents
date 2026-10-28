# Testing action 3: Perform a screen reader spot check for core flows

Part of the `osaf-testing` skill. Read this when action 3 is in scope.

- ID: `perform-a-screen-reader-spot-check-for-core-flows`
- Effort and cadence: Moderate; Ongoing
- Canonical source: [Testing phase, action 3](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/testing-phase.md#3-perform-a-screen-reader-spot-check-for-core-flows)

## Why it matters

This action validates real usability beyond automation.

## Definition of Done

1. Key tasks have documented screen reader checks.
2. The test environment is recorded.
3. Accessibility issues are fixed or tracked.

## Recommended steps, adapted from the framework

1. Identify key tasks and user journeys.
2. Select a supported screen reader and browser combination such as Windows +
   [NVDA](https://www.nvaccess.org/download/), Windows + JAWS, and macOS +
   VoiceOver. On mobile, test Android with TalkBack and iOS with VoiceOver.
3. Test the flows using a screen reader, using the
   [screen reader spot-check examples](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md#contributor-expectations).
4. Fix accessibility issues or track them.

## How to do it in this repository

- **An agent cannot perform this test.** A screen reader spot check means a
  person running a real screen reader. Your work here is to write the checks,
  choose and record the environment with the maintainer, prepare the record
  for a person to fill in, and file what they find.
- **Use the same key tasks** as action 2, so the two records line up.
- **Pick at least one combination** the project's users are likely to have,
  and list it in "Supported environments" (action 6) only once it has been
  tested. NVDA is free and runs on Windows; VoiceOver is built into macOS and
  iOS; TalkBack into Android.
- **Prepare with simulation, never substitute it.** `screen-reader-lab` walks
  HTML or JSX and narrates what a screen reader would likely announce in
  reading order, by Tab, by heading and by form field. It is an educational
  simulation based on the accessible name computation, and its own instructions
  say real behavior varies by screen reader and browser. Use it to find likely
  failures before the person tests, and report its output as simulation.
- **The accessibility tree is evidence of structure, not of a test.** The MCP
  tool `run_playwright_a11y_tree` captures the browser's accessibility tree:
  roles, names, landmarks and headings as exposed. Useful, and still not a
  screen reader run.

## Hand-offs

- `testing-coach`, through `accessibility-lead` - the procedure for the chosen
  screen reader: start-up, the keys for headings, landmarks and forms, and
  what to listen for.
- `screen-reader-lab`, through `accessibility-lead` - a simulated narration of
  each flow's markup, to prepare the test.
- `desktop-a11y-testing-coach`, through `developer-hub` - for a desktop app:
  NVDA, JAWS, Narrator and VoiceOver with platform inspection tools.
- `issue-tracker` - file what the tester finds.

## Template: screen reader spot check for one task

From the toolkit's contributor expectations, arranged as a test record.

```markdown
### Screen reader: <task name>

Environment: <screen reader and version>, <browser and version>,
<operating system and version>. Tested by <person> on <date>.

- [ ] I can navigate the page by headings and landmarks.
- [ ] Controls have clear names that match their purpose.
- [ ] Custom controls announce their role, name, value and state (expanded,
      selected, pressed).
- [ ] Lists and list items are announced as lists.
- [ ] Dynamic updates are announced (errors, loading and status messages,
      validation, toasts).
- [ ] Reading order is logical.
- [ ] The task can be completed end to end.

Result: <pass, or the barriers found with issue numbers>.
```

## Evidence to report

- Where the checks are documented, per task.
- The environment recorded, or that it is still to be chosen.
- Each check as tested by a person (with date and result), simulated only, or
  not yet run.
