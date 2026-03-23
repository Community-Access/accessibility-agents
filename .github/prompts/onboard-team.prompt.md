---
name: onboard-team
description: Generate a team-specific accessibility onboarding document with role-based checklists, tool setup guides, and learning resources. Tailored for developers, designers, QA, or content authors.
mode: agent
agent: accessibility-lead
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
---

# Accessibility Team Onboarding

Generate a customized accessibility onboarding document for a specific team role. Includes role-appropriate checklists, tool setup, testing procedures, and learning resources.

## Team role

**Role:** `${input:teamRole}`

Available roles: `developer`, `designer`, `qa-tester`, `content-author`, `project-manager`

## Instructions

1. Ask for the team role if not provided
2. Generate role-specific content:
   - **Developers:** Code patterns, testing library setup, ARIA reference, PR checklist
   - **Designers:** Color contrast tools, focus indicator design, motion preferences, annotation templates
   - **QA Testers:** Screen reader testing setup, keyboard testing flows, automated scan tools, bug report template
   - **Content Authors:** Alt text writing guide, heading hierarchy rules, link text best practices, document structure
   - **Project Managers:** WCAG overview, acceptance criteria templates, vendor evaluation checklist, compliance timelines
3. Include tool installation commands for the workspace
4. Add quick-reference checklist for daily work
5. Save to `ACCESSIBILITY-ONBOARDING-[ROLE].md`
