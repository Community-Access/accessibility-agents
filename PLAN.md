# Comprehensive Strategic Plan: Accessibility Agents v2.6 → v3.0

**Date:** March 4, 2026  
**Status:** Implementation Underway (Immediate Execution)  
**Target Release:** v3.0.0 (March 31, 2026)

---

## Executive Summary

**Accessibility Agents v3.0** will deliver three critical enhancements for a mature, production-ready agent ecosystem:

1. **Source Citation Rollout (15h)** - All 100+ agents across platforms cite authoritative sources with automated currency verification
2. **Context Compaction Guidance (2.5h)** - Users guided to manage long conversations via `/compact` slash command
3. **Create Customizations Guidance (2.5h)** - Users enabled to extend agents via custom skills and prompts

**Total Effort:** 20 hours (single person or distributed team)  
**Timeline:** All complete by March 14, 2026 (v3.0-alpha), final by March 31 (v3.0.0)  
**Release Notes:** Full changelog documenting all 20 hours of improvements across agents, docs, and automation

---

## Phase 1A: Context Compaction Guidance (2.5 hours)

**Objective:** Users understand when and how to use `/compact` for long accessibility audits.

### Deliverables

#### 1A.1 Agent Updates (1.5 hours)

Add context compaction guidance to three orchestrator agents:

**File: `.github/agents/web-accessibility-wizard.agent.md`**
- After Phase 6 (Remediation Prioritization), add:
  ```
  #### Context Management for Long Audits
  
  If this audit has taken 6+ turns and findings are accumulating, consider using `/compact` to free up context:
  - Type `/compact` to summarize findings so far
  - Include in summary: (1) issues found so far, (2) severity breakdown, (3) next remediation priorities
  - This allows deeper analysis of remaining phases without hitting context limits
  ```

**File: `.github/agents/document-accessibility-wizard.agent.md`**
- After Phase 4 (Remediation), add same guidance

**File: `.github/agents/markdown-a11y-assistant.agent.md`**
- After Phase 2 (Findings), add same guidance

#### 1A.2 Documentation (1 hour)

**Create: `docs/guides/context-management.md`**

```markdown
# Context Management for Long Accessibility Audits

When running comprehensive accessibility audits, conversations can accumulate context quickly. VS Code's `/compact` command helps manage this.

## When to Use `/compact`

- **Web audits:** After Phase 6, if still analyzing issues
- **Document audits:** After processing 3+ documents  
- **Markdown audits:** After reviewing 20+ files
- **General rule:** When conversation has 7+ turns and analysis is ongoing

## What to Include in Compact Summary

Keep your summary focused on three elements:

1. **Issues Found:** Brief count by severity (Critical, High, Medium, Low)
2. **Key Patterns:** Recurring issues across pages/documents
3. **Next Steps:** Top 3 remediations to tackle, blockers if any

Example:
```
## Summary After 8 Turns

**Issues Found:** 24 total
- 2 Critical (missing ARIA on custom widgets)
- 8 High (low contrast, missing alt text)
- 12 Medium (focus order issues)
- 2 Low (inconsistent heading levels)

**Key Patterns:** 
- Interactive components lack ARIA labels
- Images in CMS missing alt text template
- Focus management broken in navigation

**Next:** Fix ARIA labels (blocks widget testing), batch alt text updates, review focus order
```

## How to Resume After Compaction

1. After `/compact` completes, the conversation resets with summary at top
2. Continue from "Next Steps" - agent will remember context
3. If needed, reference specific finding: "Remember the 2 Critical ARIA issues from the summary?"

## Examples by Audit Type

### Web Audit Compaction
After phase 6, with 8+ turns, compact to free context for detailed remediation deep-dives.

### Document Audit Compaction  
After processing 3+ documents, compact before detailed VPAT generation.

### Markdown Compaction
After scanning 25+ files, compact before detailed link/anchor validation.

## When NOT to Compact

- Audit is in Phase 1-2 (still discovering issues) - premature
- Conversation is under 5 turns - not needed yet
- About to generate detailed report - better to keep full context
```

### Commits

```
chore: add context compaction guidance to web-accessibility-wizard, document-accessibility-wizard, markdown-a11y-assistant
docs: add context management guide for long accessibility audits (docs/guides/context-management.md)
```

**Total Phase 1A:** 2.5 hours | Deliverables: 3 agent files updated, 1 comprehensive guide created

---

## Phase 1B: Source Citation Rollout (15 hours)

**Objective:** Every agent sites authoritative sources; automated weekly verification ensures sources stay current.

### Deliverables

#### 1B.1 Copilot Agent Updates (9 hours)

**Process:** Update all 56 `.github/agents/*.agent.md` files

**Template to add after agent description:**
```yaml
## Authoritative Sources

- **WCAG 2.2 Specification:** https://www.w3.org/TR/WCAG22/
- **WAI-ARIA 1.2 Specification:** https://www.w3.org/TR/wai-aria-1.2/
- [Domain-specific sources per agent role]
```

**Inline citation standard:** When claiming something about accessibility, add source immediately after:
- ❌ "Color contrast should be 4.5:1"
- ✅ "Color contrast should be 4.5:1 **(Source: WCAG 2.2 SC 1.4.3)**"
- ✅ "Color contrast should be 4.5:1 **[WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)**"

**Batched execution (6 commits, ~1.5 hours each):**

**Batch 1 (Orchestrators):** 
- accessibility-lead, web-accessibility-wizard, web-issue-fixer, document-accessibility-wizard, document-csv-reporter
- Commit: `chore(citations): add authoritative sources to orchestrator agents`

**Batch 2 (Document agents):**
- word-accessibility, excel-accessibility, powerpoint-accessibility, pdf-accessibility, epub-accessibility
- Commit: `chore(citations): add authoritative sources to document accessibility agents`

**Batch 3 (Markdown agents):**
- markdown-a11y-assistant, markdown-scanner, markdown-fixer, markdown-csv-reporter
- Commit: `chore(citations): add authoritative sources to markdown agents`

**Batch 4 (Web specialists):**
- aria-specialist, keyboard-navigator, forms-specialist, modal-specialist, live-region-controller, alt-text-headings
- Commit: `chore(citations): add authoritative sources to web specialist agents`

**Batch 5 (Design & cognitive):**
- contrast-master, design-system-auditor, cognitive-accessibility, tables-data-specialist, link-checker
- Commit: `chore(citations): add authoritative sources to design & cognitive agents`

**Batch 6 (Workflow & helpers):**
- github-hub, nexus, analytics, daily-briefing, pr-review, issue-tracker, team-manager, repo-admin, repo-manager, + remaining 8 helper agents
- Commit: `chore(citations): add authoritative sources to workflow & helper agents`

#### 1B.2 Claude Code Agent Updates (4 hours)

**Process:** Update all 44 `.claude/agents/*.md` files

**Template:**
```markdown
## Authoritative Sources

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA 1.2: https://www.w3.org/TR/wai-aria-1.2/
- [Domain sources]
```

**Inline citations:** Same as Copilot agents

**Batched execution (2 commits, ~2 hours each):**

**Batch 1:** Web, document, markdown agents (22 agents)
- Commit: `chore(citations): add authoritative sources to Claude Code web/doc/markdown agents`

**Batch 2:** Developer tools, workflow, specialist agents (22 agents)
- Commit: `chore(citations): add authoritative sources to Claude Code dev/workflow agents`

#### 1B.3 GitHub Actions Workflow (2 hours)

**Create: `.github/workflows/verify-sources.yml`**

```yaml
name: Source Currency Verification

on:
  schedule:
    - cron: "0 9 * * *"  # Daily 9 AM UTC
  workflow_dispatch:

jobs:
  verify-sources:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      
      - name: Verify authoritative sources
        run: python3 .github/scripts/verify_sources.py
        continue-on-error: true
      
      - name: Create issue if sources changed
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: "⚠️ Source Currency: Authoritative sources may have changed",
              labels: ["automation", "source-currency", "needs-review"],
              body: `See verification results in workflow run:\n\n${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`
            })
```

**Create: `.github/scripts/verify_sources.py`**

```python
#!/usr/bin/env python3
"""
Verify that authoritative accessibility sources remain accessible and unchanged.
Computes SHA-256 of source content and compares against SOURCE_REGISTRY.json.
"""
import json
import hashlib
import requests
import sys
from pathlib import Path

REGISTRY_PATH = Path(".github/agents/SOURCE_REGISTRY.json")
TIMEOUT = 10

def verify_sources():
    """Load registry and verify each source."""
    if not REGISTRY_PATH.exists():
        print(f"⚠️ Registry not found: {REGISTRY_PATH}")
        return True
    
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)
    
    all_ok = True
    for source_name, source_data in registry.items():
        url = source_data.get("url")
        expected_sha = source_data.get("sha256")
        
        if not url:
            print(f"⚠️  {source_name}: No URL defined")
            continue
        
        try:
            response = requests.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            actual_sha = hashlib.sha256(response.content).hexdigest()
            
            if expected_sha:
                if actual_sha == expected_sha:
                    print(f"✓ {source_name}: OK (SHA verified)")
                else:
                    print(f"❌ {source_name}: SHA CHANGED")
                    print(f"   URL: {url}")
                    print(f"   Expected: {expected_sha[:16]}...")
                    print(f"   Actual:   {actual_sha[:16]}...")
                    all_ok = False
            else:
                print(f"ℹ️  {source_name}: SHA not yet set (storing...)")
                source_data["sha256"] = actual_sha
        
        except requests.exceptions.RequestException as e:
            print(f"⚠️  {source_name}: Could not fetch ({type(e).__name__})")
            all_ok = False
    
    # Save updated registry if new sources discovered
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)
    
    return all_ok

if __name__ == "__main__":
    ok = verify_sources()
    sys.exit(0 if ok else 1)
```

**Commit:**
```
chore(ci): add automated source currency verification workflow (verify-sources.yml + script)
```

**Total Phase 1B:** 15 hours | Deliverables: 100 agent files updated, 1 workflow, 1 verification script

---

## Phase 1C: Create Customizations Guidance (2.5 hours)

**Objective:** Users discover and understand how to extend agents via `/create-skill` and `/create-agent` workflows.

### Deliverables

#### 1C.1 README Enhancement (1 hour)

**File: `README.md`**

Add new section after "Quick Start" called "Extending Accessibility Agents":

```markdown
## Extending Accessibility Agents

The 57 built-in agents cover most accessibility workflows. Extend them with custom skills and agents:

### Creating a Custom Skill

Use `/create-skill` in any Copilot Chat session:

```
/create-skill [describe what you want to check or automate]
```

**Example:** `/create-skill internal accessibility compliance checklist for our government contracts (check privacy policy, ToS, no auto-redirects, FIPS compliance)`

**Result:** AI generates SKILL.md file following [agentskills.io](https://agentskills.io) specification.

**Next steps:**
1. Save to `.github/skills/my-skill-name/SKILL.md`
2. Push to repo - skill is immediately available to all agents
3. Type `/` in chat and search for your skill name to test
4. Share improvements via PR!

### Creating a Custom Agent

Use `/create-agent` to scaffold domain-specific agents:

```
/create-agent [describe agent's role and responsibilities]
```

**Example:** `/create-agent internal documentation auditor that checks our accessibility templates, WCAG A11y requirements, and links to internal guidelines`

**Next steps:**
1. Save to `.github/agents/my-agent.agent.md` (VS Code) or `.claude/agents/my-agent.md` (Claude)
2. Define `handoffs:` to delegate to existing agents
3. Test in chat, refine prompts
4. Share via PR for team use

### Learn More

See [Creating Custom Skills](docs/guides/create-custom-skills.md) for detailed walkthrough with examples.
```

#### 1C.2 Comprehensive Guide (1 hour)

**Create: `docs/guides/create-custom-skills.md`**

```markdown
# Creating Custom Accessibility Skills

**Goal:** Capture your team's repeatable accessibility workflows as reusable, shareable skills.

## When to Create a Skill

You've noticed your team repeats a 5-10 step workflow not covered by built-in agents:
- Your organization has internal accessibility checklists
- You discovered an edge case or workaround worth automating
- You want to share a pattern across your team

**Examples:**
- "Check our custom component library for accessibility"
- "Validate against our company's brand accessibility guidelines"
- "Verify PDF documents meet our specific WCAG 2.2 AAA requirements"
- "Check sensitive data fields are properly labeled and protected"

## Step 1: Document Your Workflow

Write down the exact steps. Example:

```
After web accessibility audit, always verify:
1. Privacy policy page is accessible (GDPR requirement)
2. Terms of Service page is accessible (legal hold)
3. No automatic redirects that break WCAG 2.4.2
4. Contact form works with keyboard-only navigation
5. All interactive elements labeled for screen readers
```

## Step 2: Create the Skill

In Copilot Chat, use `/create-skill`:

```
/create-skill verify compliance with our internal accessibility standards including:
- accessible privacy policy
- accessible terms of service  
- no auto-redirects (WCAG 2.4.2)
- keyboard-accessible contact forms
- proper screen reader labeling
```

**Result:** Copilot generates initial SKILL.md file with:
- Metadata (name, description, keywords)
- Checklist of your 5 steps
- Usage instructions
- Integration with existing agents

**Example generated output:**

```markdown
---
name: Internal Accessibility Compliance Checklist
description: Verifies website compliance with internal accessibility standards including privacy/ToS accessibility, no auto-redirects, keyboard navigation, and screen reader support
keywords:
  - compliance
  - internal-standards
  - privacy-policy
  - terms-of-service
  - keyboard-navigation
---

# Internal Accessibility Compliance Checklist

## Verification Steps

1. **Privacy Policy Accessibility** - Ensure privacy policy page is fully accessible (headings, lists, links)
2. **Terms of Service Accessibility** - Verify ToS page follows heading hierarchy, has proper list structure
3. **Automatic Redirects Check** - Test for auto-redirects that violate WCAG 2.4.2  
4. **Contact Form Keyboard Access** - Verify contact form fully operable via keyboard only
5. **Screen Reader Labels** - Test all interactive elements are properly labeled for assistive tech

## Integration

This skill works with:
- `web-accessibility-wizard` - Run after initial audit to verify compliance
- `web-issue-fixer` - Combine with fix-fixer for remediation validation
- `accessibility-lead` - Ask accessibility-lead to "run internal compliance check"

## Usage

After running a web audit:

```
/Internal Accessibility Compliance Checklist
```

Skill will test each requirement and report pass/fail with remediation guidance.
```

## Step 3: Refine and Test

1. Save the generated file to `.github/skills/compliance-checklist/SKILL.md`
2. In Copilot Chat, type `/` and search for skill name
3. Run it: ask accessibility-lead to invoke your skill
4. If results aren't perfect, edit the .md file and try again
5. Iterate until workflow matches your team's needs

## Step 4: Share and Version

```bash
git add .github/skills/compliance-checklist/
git commit -m "feat(skill): add internal accessibility compliance checklist

- Verifies privacy policy accessibility
- Checks Terms of Service format
- Detects auto-redirects (WCAG 2.4.2 violation)
- Tests keyboard navigation on forms
- Validates screen reader labels

Reusable across web-accessibility-wizard and web-issue-fixer."

git push origin your-feature-branch
# Then open PR for team review
```

## Community Skills Repository

Have a skill your team finds useful? Submit it!

- **Location:** `.github/skills/[skill-name]/SKILL.md`
- **Template:** See [agentskills.io spec](https://agentskills.io)
- **Naming:** kebab-case, descriptive (e.g., `wcag-aaa-enhanced`, `brand-checklist`)
- **Documentation:** Clear description, keywords, usage examples

## Examples from Community

- `wcag-aaa-enhanced.skill.md` - Stricter AAA-level conformance checks
- `wcag-aaa-enhanced.skill.md` - Tailored to high-security/government contracts
- `custom-component-audit.skill.md` - Organization's custom component library compliance
- `mobile-wcag-check.skill.md` - Mobile-specific WCAG requirements for React Native

---

**Learn more:** [agentskills.io specification](https://agentskills.io)
```

#### 1C.3 Agent Nudges (0.5 hours)

Add one-line tips to key orchestrator agents mentioning `/create-skill`:

**File: `.github/agents/accessibility-lead.agent.md`**
- Add under description: "**Tip:** Use `/create-skill` to capture your team's custom accessibility workflows as reusable skills."

**File: `.github/agents/web-accessibility-wizard.agent.md`**
- Add under description: "**Tip:** After an audit, use `/create-skill` to turn your verification workflow into a reusable skill."

**File: `.github/agents/document-accessibility-wizard.agent.md`**
- Add under description: "**Tip:** Document your organization's specific requirements as a skill via `/create-skill`."

**File: `.github/agents/developer-hub.agent.md`**
- Add under description: "**Tip:** Build custom skills for your team's domain via `/create-skill`."

### Commits

```
docs(readme): add "Extending Accessibility Agents" section with custom skill examples
docs(guides): add create-custom-skills.md with step-by-step walkthrough and examples
chore(agents): add /create-skill tips to accessibility-lead, web-accessibility-wizard, document-accessibility-wizard, developer-hub
```

**Total Phase 1C:** 2.5 hours | Deliverables: 1 README section, 1 detailed guide, 4 agent tips

---

## Phase 2-5: Deferred to v3.1+ 

The following enhancements are valuable but scheduled for v3.1 (April 2026) to focus v3.0 on shipping source citations + customizations guidance first:

- **Phase 2:** Agent Plugins (discoverable VS Code Extensions marketplace bundle)
- **Phase 3:** Lifecycle Hooks (session startup, tool execution automation)
- **Phase 4:** Agentic Browser Tools (web agents verify fixes in integrated browser)
- **Phase 5:** Agent Debug Panel Guidance (documentation for troubleshooting)

---

## Release Requirements

### Documentation Requirements for v3.0

- [x] Updated PLAN.md with v3.0 scope
- [ ] CHANGELOG.md entry: "v3.0.0: Source citations, context management, custom skills guidance"
- [ ] Updated prd.md version to 3.0
- [ ] Updated version in all installers/updaters to 3.0.0
- [ ] Release notes highlighting: citation authority, custom skill workflows, long-audit guidance

### Testing Checklist for v3.0

- [ ] Verify all 100+ agents have `## Authoritative Sources` section
- [ ] Test `/create-skill` workflow from accessibility-lead
- [ ] Test `/compact` guidance appears in web-accessibility-wizard after Phase 6
- [ ] Verify citations are clickable and target correct W3C/authoritative docs
- [ ] Run GitHub Actions workflow manually, verify it creates currency check issues

### Git Commits for v3.0

**Phase 1A commits (context compaction):**
```
chore: add context compaction guidance to web-accessibility-wizard, document-accessibility-wizard, markdown-a11y-assistant
docs: add context management guide for long accessibility audits
```

**Phase 1B commits (source citations):**
```
chore(citations): add authoritative sources to orchestrator agents
chore(citations): add authoritative sources to document accessibility agents
chore(citations): add authoritative sources to markdown agents
chore(citations): add authoritative sources to web specialist agents
chore(citations): add authoritative sources to design & cognitive agents
chore(citations): add authoritative sources to workflow & helper agents
chore(citations): add authoritative sources to Claude Code web/doc/markdown agents
chore(citations): add authoritative sources to Claude Code dev/workflow agents
chore(ci): add automated source currency verification workflow
```

**Phase 1C commits (custom skills guidance):**
```
docs(readme): add "Extending Accessibility Agents" section
docs(guides): add create-custom-skills.md guide
chore(agents): add /create-skill tips to key agents
```

**Version bump commits:**
```
chore(release): bump version to 3.0.0 in installers, prd.md, CHANGELOG
chore(release): add v3.0.0 release notes
```

---

## Success Metrics for v3.0

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Citation Coverage** | 100% of agents cite sources | Grep for `## Authoritative Sources` in all 100 agent files |
| **Source Currency** | Workflow runs cleanly, 0 broken sources | Check GitHub Actions runs for verify-sources.yml |
| **Custom Skill Adoption** | 5+ community skills submitted in PR form | Monitor PRs with `skill:` labels |
| **User Feedback** | "I now understand where agents get their info" | Gather in release survey |
| **Documentation Gap** | Zero issues about "how do I create a skill?" | Monitor GitHub Issues, Discord |

---

## Version History

| Date | Version | Status |
|------|---------|--------|
| 2026-03-04 | 1.0 (v3.0 plan) | Initial plan: 20 hours across 3 parallel workstreams |

---

**Authors:** @jeffreybishop, @taylorarndt  
**Repository:** https://github.com/Community-Access/accessibility-agents  
**Discord/Community:** #accessibility-agents
