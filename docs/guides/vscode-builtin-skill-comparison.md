# VS Code Built-in Accessibility Skill Comparison

> **Last Updated:** March 5, 2026  
> **VS Code Version:** 1.110+

## Overview

VS Code 1.110 introduced a **built-in accessibility skill** to help developers create accessible features. This document explains how Accessibility Agents **complement and extend** the platform-provided skill with specialized domain expertise.

---

## VS Code Built-in Accessibility Skill

**Scope:** General accessibility guidance for new feature development in VS Code extensions and web projects.

**Coverage:**

- Basic WCAG 2.1 AA principles
- Semantic HTML recommendations
- ARIA best practices (high-level)
- Keyboard navigation basics
- Color contrast awareness
- Screen reader compatibility considerations

**Strengths:**

- Always available (no installation required)
- Fast, lightweight responses
- Good for quick accessibility checks during development
- Integrated into all VS Code agent workflows

---

## Accessibility Agents: Specialized Domain Expertise

**Scope:** Comprehensive accessibility auditing, remediation, and compliance across web, document, and mobile platforms.

**How We Extend VS Code's Built-in Skill:**

### 1. Domain Specialization

| Domain | VS Code Built-in | Accessibility Agents |
|--------|------------------|---------------------|
| **Web (HTML/JSX)** | ✅ Basic guidance | ✅✅✅ 9 specialist agents (ARIA, modals, forms, keyboard, tables, links, alt text, live regions, contrast) |
| **Documents (Office/PDF)** | ❌ No coverage | ✅✅✅ 6 specialist agents (Word, Excel, PowerPoint, PDF, ePub, markdown) |
| **Mobile (React Native)** | ❌ No coverage | ✅✅✅ 1 specialist agent (iOS, Android, RN/Expo patterns) |
| **Design Systems** | ❌ No coverage | ✅✅✅ 1 specialist agent (token contrast validation) |
| **Cognitive A11y** | ❌ No coverage | ✅✅✅ 1 specialist agent (WCAG 2.2 cognitive SC, COGA) |
| **Desktop Apps** | ❌ No coverage | ✅✅✅ 2 specialist agents (UIA/MSAA/ATK APIs, screen reader testing) |

### 2. WCAG 2.2 Conformance

| Criteria | VS Code Built-in | Accessibility Agents |
|----------|------------------|---------------------|
| **WCAG Version** | 2.1 AA (general principles) | 2.2 AA (complete SC-by-SC mapping) |
| **New in WCAG 2.2** | ⚠️ Limited coverage | ✅ Full coverage (2.4.11, 2.4.12, 2.4.13, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8, 3.3.9) |
| **Conformance Reports** | ❌ No | ✅ VPAT/ACR compliance exports |
| **Severity Scoring** | ❌ No | ✅ 0-100 scoring with A-F grades |

### 3. Audit Workflows

| Feature | VS Code Built-in | Accessibility Agents |
|---------|------------------|---------------------|
| **Interactive Audits** | ❌ No | ✅ 3 wizard agents (web, document, markdown) |
| **Multi-Phase Workflows** | ❌ No | ✅ Step-by-step guided audits (6-7 phases) |
| **Cross-Page Analysis** | ❌ No | ✅ Pattern detection across multiple pages |
| **Delta Scanning** | ❌ No | ✅ Changed files only (git diff integration) |
| **Remediation Tracking** | ❌ No | ✅ Fixed/New/Persistent/Regressed tracking |

### 4. Tool Integration

| Tool | VS Code Built-in | Accessibility Agents |
|------|------------------|---------------------|
| **axe-core CLI** | ❌ No | ✅ Automated scanning in web wizard |
| **Lighthouse CI** | ❌ No | ✅ Scanner bridge with deduplication |
| **GitHub A11y Scanner** | ❌ No | ✅ Scanner bridge with issue correlation |
| **Office Accessibility Checker** | ❌ No | ✅ Rule engine with WCAG mapping |
| **PDF/UA Validators** | ❌ No | ✅ Matterhorn Protocol checks |

### 5. Fix Application

| Capability | VS Code Built-in | Accessibility Agents |
|------------|------------------|---------------------|
| **Auto-Fixable Issues** | ⚠️ Limited | ✅ Missing alt/lang/labels/tabindex |
| **Framework-Specific Fixes** | ❌ No | ✅ React/Vue/Angular/Svelte/Tailwind patterns |
| **Batch Remediation** | ❌ No | ✅ PowerShell/Bash scripts for documents |
| **Human-Judgment Items** | ❌ No | ✅ Interactive fix mode with approval |

### 6. Lifecycle Enforcement

| Enforcement | VS Code Built-in | Accessibility Agents |
|-------------|------------------|---------------------|
| **Edit Gate** | ❌ No | ✅ Blocks UI file edits until accessibility reviewed |
| **Proactive Detection** | ⚠️ Reactive (on request) | ✅ Hooks fire on every web UI prompt |
| **Session Tracking** | ❌ No | ✅ Markers persist across entire session |
| **Hook Debugging** | ❌ No | ✅ Agent Debug Panel integration |

---

## When to Use Each

### Use VS Code Built-in Accessibility Skill When

- ✅ You need quick accessibility guidance during development
- ✅ You're adding a new control or feature and want basic checks
- ✅ You want general WCAG principles without deep domain knowledge
- ✅ You're working on a non-web, non-document project (e.g., backend API)

### Use Accessibility Agents When

- ✅ You need comprehensive WCAG 2.2 AA conformance audits
- ✅ You're auditing Office documents, PDFs, or ePub files
- ✅ You're building React Native or mobile apps
- ✅ You need severity scoring and remediation tracking
- ✅ You're preparing VPAT/ACR compliance reports
- ✅ You want framework-specific fix recommendations
- ✅ You need lifecycle hooks to enforce accessibility reviews
- ✅ You're auditing markdown documentation for accessibility
- ✅ You're validating design system tokens for contrast
- ✅ You need cognitive accessibility (COGA) guidance

---

## Layered Approach: Best of Both Worlds

**Recommended Strategy:**

1. **VS Code built-in skill** provides real-time, lightweight accessibility awareness during all development
2. **Accessibility Agents** provide deep, specialized audits when you need comprehensive review

**Example Workflow:**

```text
Day-to-day development:
  ├─ VS Code built-in skill suggests accessible patterns ✅
  └─ Developer follows general guidance

Before commit/PR:
  ├─ Invoke accessibility-lead agent for comprehensive review ✅
  └─ Run web-accessibility-wizard for full WCAG 2.2 audit ✅

Before release:
  ├─ Run document-accessibility-wizard on all documentation ✅
  ├─ Generate VPAT compliance report ✅
  └─ Export CSV findings with remediation links ✅
```

---

## Unique Value Propositions

**What Accessibility Agents Provide That VS Code Built-in Skill Doesn't:**

1. **57 Specialized Agents** - Domain experts for every accessibility scenario
2. **17 Reusable Skills** - Deep knowledge bases agents can reference
3. **104 Slash Command Prompts** - One-click workflows for common tasks
4. **Multi-Platform Support** - GitHub Copilot, Claude Code, Gemini, Codex, Desktop CLI
5. **Lifecycle Hooks** - Proactive enforcement before code is written
6. **Orchestrator Agents** - Step-by-step guided workflows for complex audits
7. **Remediation Tracking** - Delta comparison between audit snapshots
8. **Framework Intelligence** - React/Vue/Angular/Svelte/Tailwind-specific patterns
9. **Document Accessibility** - Office, PDF, ePub - domains VS Code doesn't cover
10. **Mobile Accessibility** - React Native, iOS, Android - 60% of traffic
11. **Scanner Integration** - axe-core, Lighthouse, GitHub A11y Scanner bridges
12. **Compliance Exports** - VPAT 2.5 / ACR reports for enterprise

---

## Complementary, Not Competitive

**Accessibility Agents are designed to work alongside VS Code's built-in accessibility skill**, not replace it. Think of it this way:

- **VS Code built-in:** Your accessibility co-pilot ✈️ (always there, lightweight, general guidance)  
- **Accessibility Agents:** Your accessibility SWAT team 🚁 (call them in for deep audits, compliance, remediation)

Both are valuable. Both make your projects more accessible.

---

## FAQ

### Q: Should I disable VS Code's built-in accessibility skill?

**A:** No! Keep it enabled. It provides valuable real-time guidance that complements our specialized agents.

### Q: Will Accessibility Agents conflict with the built-in skill?

**A:** No. Our agents are explicitly invoked via slash commands, agent picker, or lifecycle hooks. The built-in skill runs passively. They work together seamlessly.

### Q: Do I need Accessibility Agents if VS Code has built-in accessibility?

**A:** If you need:

- Comprehensive WCAG 2.2 audits
- Document accessibility (Office/PDF)
- Mobile accessibility (React Native)
- Compliance reports (VPAT/ACR)
- Remediation tracking across audits
- Framework-specific fix patterns

Then yes, you need Accessibility Agents. The built-in skill provides general guidance; our agents provide specialized expertise.

### Q: Can I use Accessibility Agents without VS Code?

**A:** Yes! We support:

- GitHub Copilot (VS Code, VS, JetBrains)
- Claude Code CLI (terminal-based)
- Claude Desktop (desktop app)
- Gemini CLI (terminal-based)
- Codex CLI (terminal-based)

### Q: How often do you update to match VS Code changes?

**A:** We review every VS Code release (monthly) and implement relevant features within 30 days. See our [CHANGELOG.md](../../CHANGELOG.md) for release history.

---

## Next Steps

- **New to Accessibility Agents?** Start with [Getting Started](../getting-started.md)
- **Want to see agents in action?** Check out [Example Workflows](../../example/)
- **Need help?** Open a [GitHub Discussion](https://github.com/Community-Access/accessibility-agents/discussions)

---

**Related Documentation:**

- [Agent Debug Panel Guide](agent-debug-panel.md) - Troubleshoot agent loading
- [Context Management](context-management.md) - Session forking and compaction
- [Lifecycle Hooks](../hooks-guide.md) - Proactive accessibility enforcement
