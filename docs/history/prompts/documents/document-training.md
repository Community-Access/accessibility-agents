# document-training

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/prompts/documents/document-training.md`.

Generate role-specific accessibility training materials for document authors. Covers common mistakes, best practices, hands-on exercises, and quick reference cards tailored to specific roles and applications.

## When to Use It

- When onboarding new team members who create documents
- When building accessibility training for a specific role (author, editor, designer, manager)
- When you need application-specific training (Word, Excel, PowerPoint, PDF, or all)
- When creating a quick reference card for a team

## How to Launch It

**In GitHub Copilot Chat:**

```text
/document-training
```

Provide the role and application when prompted:

```text
/document-training
Role: author
Application: word
```

## What It Generates

1. **Common Mistakes** — Top errors made by this role in this application
2. **Best Practices Checklist** — Step-by-step checklist for creating accessible documents
3. **Hands-On Exercises** — Practice activities with real scenarios
4. **Quick Reference Card** — One-page printable reference
5. **Role-Specific Guidance** — Tips tailored to the selected role

## Supported Roles

- **Author** — Creates documents from scratch
- **Editor** — Reviews and revises existing documents
- **Designer** — Focuses on layout, branding, templates
- **Manager** — Oversees document production, sets policy

## Related

- [create-accessible-template](./create-accessible-template.md) — Template creation guidance
- [document-accessibility-wizard](../../../reference/skills/document-accessibility-wizard.md) — Full audit workflow
