---
name: component-library-audit
description: Audit every component in a component library directory for accessibility. Generates a per-component scorecard with severity-ranked issues.
mode: agent
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
  - runInTerminal
---

# Component Library Accessibility Audit

Audit all components in a library directory for accessibility compliance. Each component gets its own scorecard with score, grade, and issues.

## Component Directory

**Path:** `${input:componentDir}`

## Instructions

### Phase 1: Discovery

1. Scan the directory for component files (`.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`)
2. List all discovered components by name
3. Group components by type (forms, navigation, modals, data display, layout)

### Phase 2: Per-Component Audit

For each component, check:

- **ARIA correctness** — Valid roles, states, properties for the component type
- **Keyboard interaction** — All interactive elements focusable and operable
- **Screen reader names** — Accessible names computed correctly
- **Focus management** — Focus trapped where needed, returned after close
- **Color/contrast** — No hardcoded colors with insufficient contrast
- **Form labeling** — All inputs have associated labels
- **Heading structure** — Headings used correctly within the component
- **Link text** — No ambiguous "click here" link text

### Phase 3: Scorecard Generation

For each component, produce:

| Field | Value |
|-------|-------|
| Component | Name |
| Score | 0-100 |
| Grade | A-F |
| Critical Issues | Count |
| Serious Issues | Count |
| Moderate Issues | Count |
| Minor Issues | Count |

### Phase 4: Cross-Component Analysis

Identify shared patterns:

- **Template-level issues** — Same issue in multiple components (fix once, fix everywhere)
- **Design token issues** — Color or spacing tokens causing multiple failures
- **Missing patterns** — Components that should exist but don't (skip link, live region wrapper)

### Phase 5: Report

Sort by score ascending (worst components first) and write the audit report with:

1. Summary table of all components with scores
2. Per-component findings with remediation guidance
3. Template-level issues section
4. Priority fix list (highest-impact fixes first)
