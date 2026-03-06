# Debug Panel Workflows

This guide helps users troubleshoot agent behavior with the VS Code Agent Debug Panel.

## What the Debug Panel Shows

The debug panel provides runtime details for each chat turn:

- Loaded instructions and customizations
- Selected agent and model
- Tool invocations and outcomes
- Sub-agent handoffs and return payloads
- Completion timing and token usage (when available)

Use this view when an agent appears to skip a required step, ignores a customization, or returns incomplete output.

## Open the Panel

1. Open Command Palette.
2. Run `Developer: Open Agent Debug Panel`.
3. Re-run the prompt you want to inspect.

If the panel is empty, run one prompt after opening the panel so events are captured.

## Workflow 1: Agent Did Not Follow a Rule

Use this when an agent misses an expected check such as keyboard navigation or heading structure.

1. Confirm the expected instruction file was loaded.
2. Confirm the file you edited matches the instruction `applyTo` glob.
3. Check whether a specialist handoff happened.
4. Check tool outputs for parse errors or failed searches.
5. Re-run with a narrower scope prompt and compare the event trace.

Common cause: instruction scope mismatch (for example, `*.tsx` rule while editing a `.md` file).

## Workflow 2: Sub-Agent Handoff Failed

Use this when an orchestrator says it delegated work but results are incomplete.

1. Find the handoff event and inspect the prompt sent to the sub-agent.
2. Verify required inputs were present (paths, URLs, config, issue list).
3. Check the returned payload for required fields.
4. If fields are missing, retry with explicit structured-output requirements.

Expected structured outputs should include rule ID, severity, location, remediation, and confidence.

## Workflow 3: Tool Call Failed or Returned Empty Data

Use this when scans or searches return zero results unexpectedly.

1. Locate the failing tool invocation.
2. Check input arguments such as `includePattern`, URL, or file path.
3. Check whether the command was run in the expected workspace folder.
4. Retry once with corrected parameters.

Do not repeatedly retry the same failing call without changing inputs.

## Workflow 4: Browser Verification Did Not Run

Use this for web verification workflows.

1. Confirm browser tools are enabled in settings:
   - `workbench.browser.enableChatTools: true`
2. Confirm a dev server is running.
3. Check for browser tool calls (`open_browser_page`, screenshot actions).
4. If unavailable, proceed in manual verification mode and record that status.

## Fast Triage Checklist

- Correct agent selected
- Expected instruction file loaded
- Correct file type matched by `applyTo`
- Required config files present
- Tool errors reviewed
- Handoff payload validated

## Reporting a Reproducible Issue

When filing an issue, include:

- Prompt text
- Agent name
- File path(s)
- Debug panel event snippet showing failure
- Expected behavior
- Actual behavior

This makes fixes deterministic and easier to validate.
