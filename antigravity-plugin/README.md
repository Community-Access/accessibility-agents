# Accessibility Agents Plugin for Antigravity CLI (`agy`)

This plugin provides **80 specialized accessibility agents** and **26 accessibility skills** for the Google Antigravity CLI (`agy`), Antigravity 2.0, and Antigravity IDE. It enforces WCAG 2.2 Level AA compliance across web UI components, Office and PDF documents, desktop applications, and GitHub workflows.

## Installation

### Automatic Installation

Using PowerShell installer:

```powershell
.\install.ps1 -Antigravity
```

Using Bash installer:

```bash
./install.sh --antigravity
```

### Manual Installation

Copy the `antigravity-plugin` folder to your global Antigravity CLI plugin directory:

```bash
mkdir -p ~/.gemini/antigravity-cli/plugins/accessibility-agents
cp -r antigravity-plugin/* ~/.gemini/antigravity-cli/plugins/accessibility-agents/
```

Or for project-level usage, place the `.antigravity/` folder in your project root.

## Features

- **80 Specialized Agents**: Orchestrators, web specialists, document wizards, GitHub tools, and desktop accessibility experts.
- **26 Reusable Skills**: Rule definitions, scanning patterns, severity scoring, and compliance mapping.
- **Agent Discovery & Switcher**: Use `/agents` inside `agy` to browse and select agents.
- **Automatic Context Enforcement**: Baseline WCAG AA rules enforced on code creation and editing via `ANTIGRAVITY.md`.
- **Zero Emoji Policy**: Complies with strict repository standards (no emoji characters in generated or edited content).

## Key Agents

| Agent | Purpose |
|-------|---------|
| `accessibility-lead` | Master orchestrator for web accessibility auditing and code review |
| `web-accessibility-wizard` | Guided step-by-step web accessibility audit |
| `document-accessibility-wizard` | Office (.docx, .xlsx, .pptx) and PDF document audit coordinator |
| `aria-specialist` | WAI-ARIA 1.2 roles, states, properties, and widget patterns |
| `contrast-master` | Color contrast ratios, dark mode, and focus ring compliance |
| `keyboard-navigator` | Tab order, keyboard traps, arrow keys, and focus management |
| `forms-specialist` | Form labeling, error validation, fieldsets, and autocomplete |
| `nexus` / `github-hub` | GitHub workflow automation and triage coordinator |

## Documentation & Help

For complete documentation, see [ANTIGRAVITY-GUIDE.md](../docs/ANTIGRAVITY-GUIDE.md).
