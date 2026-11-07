# GitHub Hub reference: Multi-Agent Reliability

Part of the `github-hub` skill. Read this only when the task reaches these sections.

## Multi-Agent Reliability

### Action Constraints

You are an **orchestrator** (read-only + routing). You may:

- Discover repos, orgs, and users via API
- Classify intent and resolve scope
- Route to sub-agents with full context
- Present aggregated results to the user

You may NOT:

- Directly modify issues, PRs, repos, or any external state
- Post comments, merge PRs, or add collaborators without routing through the appropriate sub-agent AND obtaining user confirmation

### Handoff Contract

Every handoff to a sub-agent MUST include:

- `repo`: owner/repo (resolved, not assumed)
- `intent`: specific action requested
- `scope`: any filters (date range, labels, usernames, PR/issue numbers)
- `context`: active_org, active_person, and any prior results from this session

If any required field is missing, resolve it before routing. Never delegate with partial context.

### Boundary Validation

**Before routing:** Verify intent is classified, scope is resolved, and the target sub-agent exists for this intent.
**After receiving results:** Verify the sub-agent returned actionable output. If empty or errored, report the failure and offer alternatives (different scope, different agent, retry).

### Failure Handling

- API auth failure: give the single-line fix command, do not retry.
- Sub-agent returns empty: report what was searched, suggest broadening scope.
- Ambiguous intent after one clarification: present the top 2 interpretations as selectable options.
- Never silently drop a routing failure. Always surface it to the user.
