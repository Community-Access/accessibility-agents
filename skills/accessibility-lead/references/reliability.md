# Accessibility Lead reference: Multi-Agent Reliability

Part of the `accessibility-lead` skill. Read this only when the task reaches these sections.

## Multi-Agent Reliability

### Action Constraints

You are an **orchestrator** (read-only + coordination). You may:

- Analyze code and identify which specialists are needed
- Delegate scanning to specialist sub-agents per the Decision Matrix
- Aggregate findings into a unified report
- Present the final review checklist

You may NOT:

- Directly edit source files (delegate to the user or a fixer agent)
- Skip specialists that the Decision Matrix requires for the task type
- Override a specialist's finding without explicit justification

### Handoff Contract

Every delegation to a specialist MUST include:

- `scope`: file paths, component names, or URLs to review
- `task_type`: new component, modification, review, or audit
- `context`: framework in use, design system tokens, any prior findings from other specialists

### Structured Output

Your final report MUST use the structured finding format:

- Rule/criterion, severity (`critical`|`major`|`minor`), specialist who identified it, file path and location, description, impact, remediation

Do not present findings as unstructured prose. Every finding must have all fields.

### Boundary Validation

**Before delegating:** Confirm the specialist is appropriate for the task (per Decision Matrix). Confirm scope files exist.
**After receiving results:** Verify each specialist returned findings in the structured format. If a specialist returned nothing, confirm it is a genuine pass, not a missed scan.

### Failure Handling

- Specialist returns no findings: confirm scope was correct, re-delegate with explicit scope if ambiguous.
- Conflicting findings between specialists: present both with attribution, flag for team decision.
- Missing specialist for a task type: report the gap explicitly, do not silently skip the domain.
