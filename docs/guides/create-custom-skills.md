# Creating Custom Skills and Rules

This guide explains how to extend the accessibility agents platform with custom accessibility rules, skills, and domain-specific guidance.

## What Is a Skill?

A **Skill** is a reusable knowledge domain that agents reference for guidance on a specific topic. Each skill is:

- **Focused** — covers one domain (e.g., WCAG scoring, Tailwind contrast, etc.)
- **Authoritative** — grounds recommendations in official sources
- **Reusable** — referenced by multiple agents across the platform
- **Validated** — tested against real-world accessibility issues

### Skill Structure

```text
Claude Code Plugin Structure:
  .claude/
    agents/
      your-skill-name.md

Your Custom Skill Structure:
  .claude/skills/my-custom-domain/
    SKILL.md              # Main skill documentation
    rules.json            # Optional: Structured rule definitions
    examples/
      example-1.md
      example-2.md
```

## Creating a Custom Skill (Step by Step)

### Step 1: Plan Your Skill

Ask yourself:

1. **What accessibility domain is this?**
   - New accessibility standard?
   - Industry-specific rules (e.g., fintech, healthcare)?
   - Framework-specific patterns (e.g., Svelte 5)?
   - Regional compliance?

2. **Who will use this?**
   - Single agent? (less formal)
   - Multiple agents? (high-quality documentation required)
   - Internal team? (trusted sources OK)
   - Public? (authoritative sources required)

3. **What decisions does this guide?**
   - Rule implementation (yes/no/how)
   - Priority ordering
   - Platform dependencies
   - Exception handling

4. **What's the authority?**
   - WCAG criterion?
   - Industry standard?
   - Platform vendor guidance?
   - Research paper?
   - Internal best practice?

### Step 2: Create the Skill File

Create `.claude/skills/my-custom-domain/SKILL.md`:

```markdown
---
name: my-custom-domain
version: "1.0"
description: [One sentence describing what this skill covers]
tags: 
  - wcag
  - custom-domain
appliesTo:
  - aria-specialist
  - web-accessibility-wizard
sources:
  - name: "WCAG 2.2 Success Criterion X.X.X"
    url: "https://www.w3.org/WAI/WCAG22/Understanding/..."
  - name: "Industry Standard Name"
    url: "https://..."
---

## Overview

[2-3 sentences explaining what this skill covers and who should use it]

## Scope

This skill applies to:
- [Platform/framework/context 1]
- [Platform/framework/context 2]
- [Does NOT apply to: cases where this is not relevant]

## Core Rules

### Rule 1: [Rule Name]

**When to apply:** [Conditions]

**Implementation:**
[How to implement this rule, with code examples]

**WCAG/Standard Reference:** [Which criterion this satisfies]

**Common Mistakes:**
- Mistake 1
- Mistake 2

**Example (Correct):**
[Code example showing correct implementation]

**Example (Incorrect):**
[Code example showing what to avoid]

---

### Rule 2: [Rule Name]

[etc.]

## Decision Tree

If you're unsure whether to apply this skill, use this decision tree:

```

Do you have [context X]?
├─ Yes → Apply Rule 1, Rule 2
├─ No  → Apply Rule 3

```python

## Edge Cases

### Edge Case 1

[Describe the edge case and how to handle it]

### Edge Case 2

[Describe the edge case and how to handle it]

## Quick Reference

| Scenario | Rule(s) to Apply | Priority |
|----------|------------------|----------|
| Scenario A | Rule 1, Rule 2 | High |
| Scenario B | Rule 3 | Low |

## Migration Guide

If upgrading from an older version:

### v1.0 → v2.0
[What changed, what needs updating]

## See Also

- `../related-skill/SKILL.md`
- [WCAG Criterion 1.2.3](https://www.w3.org/WAI/WCAG22/Understanding/...)
- [External Reference](https://example.com)
```

### Step 3: Add Structured Rules (Optional)

If your skill defines many rules, create a `rules.json` file for programmatic access:

```json
{
  "domain": "my-custom-domain",
  "version": "1.0",
  "rules": [
    {
      "id": "RULE-001",
      "name": "Rule 1 Name",
      "severity": "critical",
      "wcagCriterion": "1.2.3",
      "description": "What this rule checks for",
      "appliesTo": ["platform1", "framework1"],
      "autoFixable": true,
      "sources": [
        {
          "name": "WCAG 2.2 SC 1.2.3",
          "url": "https://..."
        }
      ]
    },
    {
      "id": "RULE-002",
      "name": "Rule 2 Name",
      "severity": "high",
      "wcagCriterion": "2.4.4",
      "description": "What this rule checks for",
      "appliesTo": ["platform2"],
      "autoFixable": false,
      "sources": [...]
    }
  ]
}
```

### Step 4: Add Examples (Recommended)

Create `.claude/skills/my-custom-domain/examples/` with real-world examples:

**example-1.md:**

```markdown
# Example: Implementing Rule 1

## Scenario
[Brief description of when you'd encounter this]

## Problem
[What goes wrong without this rule]

## Solution
[Code showing the correct implementation]

## Result
[What you gain from applying this rule]

## Notes
[Any caveats or gotchas]
```

### Step 5: Reference Your Skill in Agents

Update agent files to reference your skill. In an agent's Behavioral Rules section:

```markdown
## Custom Domain Guidance

For [domain-specific] issues, reference the custom skill:
`../path/to/skill/SKILL.md`

This skill provides:
- Rule definitions for [use case 1]
- Decision trees for [use case 2]
- Examples for [use case 3]
```

## Publishing Your Skill

### Internal Team Skills

For team-internal skills that shouldn't go public:

1. Create in `.claude/skills/my-internal-domain/`
2. Add permission restrictions (if using): `.claude/metadata/acl.json`
3. Document in team wiki/confluence
4. Link from team-used agents only

### Public/Community Skills

To publish a skill for the public accessibility-agents repository:

1. ✅ **Source validation**
   - All recommendations mapped to authoritative sources
   - Sources tested for link rot
   - Citations in structured format

2. ✅ **Quality bar**
   - At least 3 detailed rule examples
   - Decision tree or guidance flow
   - Real-world use cases
   - Platform/framework tested

3. ✅ **Documentation**
   - SKILL.md with full structure
   - rules.json if 5+ rules
   - 2-3 examples/ files
   - README explaining the skill

4. ✅ **Testing**
   - Validate against accessibility-agents test suite
   - Run verify-sources.yml to check all links
   - Tested by 2+ independent reviewers

5. **Submit PR** to accessibility-agents repo with:
   - Skill file(s)
   - Examples
   - Updated agent reference(s)
   - Sources documentation

## Skill Governance

### Maintenance

Skills are considered "maintained" if:

- Links to authoritative sources pass `verify-sources.yml` checks
- No unresolved issues tagged `skill:my-skill`
- At least one maintainer has reviewed recent changes

### Deprecation

Skills are deprecated if:

- Authority changes (e.g., WCAG 2.3 supersedes a criterion)
- Platform/framework drops support
- New research contradicts previous guidance
- Better alternative skill exists

**Deprecation process:**

1. Add `status: deprecated` to SKILL.md frontmatter
2. Add deprecation notice in overview
3. Link to replacement skill
4. Update referencing agents
5. Remove from agent recommendations after 1 release cycle

## Common Skill Patterns

### Platform-Specific Skill

For React, Vue, Angular, Svelte, etc.:

```text
.claude/skills/framework-accessibility-[name]/
  SKILL.md              # Framework-specific patterns
  rules.json            # Framework-specific rules
  examples/
    correct.tsx         # Framework-specific code
    incorrect.tsx       # Common mistakes
```

### WCAG Criterion Skill

For detailed guidance on a single SC:

```text
.claude/skills/wcag-[criterion]/
  SKILL.md              # Deep dive on that criterion
  rules.json            # How to test it
  examples/
    pass.html           # Conformant example
    fail.html           # Non-conformant example
```

### Domain-Specific Skill

For vertical markets (fintech, healthcare, education, e-commerce):

```text
.claude/skills/[industry]-accessibility/
  SKILL.md              # Industry-standard requirements
  rules.json            # Industry-specific rules
  examples/
    [use-case-1].md     # Real-world compliance case
    [use-case-2].md
```

### Tool/Library Skill

For accessibility-focused libraries:

```text
.claude/skills/[library]-accessibility/
  SKILL.md              # How to use [library] accessibly
  rules.json            # [Library] accessibility checks
  examples/
    integration.tsx     # How to integrate [library]
    testing.tsx         # How to test [library]
```

## Example: Creating a Fintech Accessibility Skill

Here's a complete walkthrough of creating a fintech-specific skill:

### 1. Plan (5 min)

- Domain: Financial services accessibility
- Authority: WCAG 2.2 AA + PCI DSS Accessibility + Industry standards
- Users: E-commerce specialist, developer-hub agents
- Decisions: Number validation, currency input, data table rules

### 2. Create (30 min)

**`.claude/skills/fintech-accessibility/SKILL.md`:**

```markdown
---
name: fintech-accessibility
version: "1.0"
appliesTo:
  - e-commerce-specialist
  - developer-hub
sources:
  - name: "WCAG 2.2 SC 1.3.1 - Info and Relationships"
    url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships"
  - name: "PCI Data Security Standard - Accessibility"
    url: "https://www.pcisecuritystandards.org/"
---

## Financial UI Accessibility

Rules for e-commerce, payment forms, account dashboards.

### Rule 1: Currency Input Validation

When accepting currency input:
- Label must say "Amount in USD" (not just "Amount")
- Validation must announce error via aria-live="polite"
- Error message must identify which field

[Example code...]
```

### 3. Examples (20 min)

**`.claude/skills/fintech-accessibility/examples/correct-payment-form.tsx`:**

```tsx
// Correct: Validating currency input accessibly
<form onSubmit={handleSubmit}>
  <label htmlFor="amount">Amount in USD</label>
  <input
    id="amount"
    type="text"
    inputMode="decimal"
    aria-describedby="amount-help amount-error"
    value={amount}
    onChange={handleAmountChange}
  />
  <div id="amount-help" className="help-text">
    Enter up to 2 decimal places
  </div>
  {error && (
    <div
      id="amount-error"
      role="alert"
      aria-live="polite"
    >
      {error}
    </div>
  )}
</form>
```

### 4. Publish (10 min)

- ✅ Sources validated (PCI accessible.org URL + WCAG linked)
- ✅ Examples tested with screen reader
- ✅ Added to e-commerce-specialist agent references
- ✅ Open PR with fintech-accessibility skill

## Maintenance Going Forward

Once published, your skill is:

- Included in `verify-sources.yml` link checking
- Upgraded in agent references when new versions drop
- Monitored for link rot and standard changes
- Eligible for community contributions and improvements

---

## Checklists

### Skill Creation Checklist

- [ ] Skill domain identified (singular focus)
- [ ] Authority source(s) identified and linked
- [ ] SKILL.md created with full structure
- [ ] At least 2 code examples (correct and incorrect)
- [ ] Agents updated to reference the skill
- [ ] Links validated (200 OK status)
- [ ] Reviewed by 1 team member

### Public Skill Checklist (before PR)

- [ ] Above checklist complete ✅
- [ ] rules.json created (if 5+ rules)
- [ ] 3+ examples/ files included
- [ ] README explaining the skill
- [ ] All sources cited with full URLs
- [ ] verify-sources.yml passes
- [ ] Tested by 2+ independent reviewers
- [ ] No merge conflicts with main

---

**See also:**

- [Authoritative Sources Guide](./authoritative-sources.md) - Citing sources correctly
- [Context Management Guide](./context-management.md) - Managing conversation context
- [Agent Architecture](../architecture.md) - How agents are structured
