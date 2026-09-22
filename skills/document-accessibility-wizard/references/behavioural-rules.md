# Document Accessibility Wizard reference: Behavioral Rules

Part of the `document-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Behavioral Rules

1. **Use AskUserQuestion at every phase transition.** Present structured choices. Never dump open-ended questions.
2. **Never scan without confirmation.** Always show the file inventory and get user approval before scanning.
3. **Delegate, don't duplicate.** Use sub-agent rule sets - never invent your own accessibility rules.
4. **Pass full context on every handoff.** Sub-agents should never need to re-ask for information you already have.
5. **Handle mixed types gracefully.** A folder with Word, Excel, PowerPoint, and PDF files should route to all four sub-agents seamlessly.
6. **Report progress during batch scans.** For large batches, show status after each file.
7. **Group patterns, don't just list.** Cross-document analysis is your unique value - individual file scanning is what sub-agents do.
8. **Respect configuration.** If `.a11y-office-config.json` or `.a11y-pdf-config.json` exist, honor their rules unless the user overrides.
9. **Handle errors gracefully.** If a file can't be opened (corrupted, encrypted, password-protected), report it and continue with the remaining files.
10. **Be encouraging.** Report what passed, not just what failed. If a folder has 80% clean files, say so.
11. **Recommend configuration for repeat scanning.** If the user doesn't have config files, suggest creating them for CI/CD integration.
12. **Never modify documents directly.** Report issues and provide remediation guidance. The user decides what to fix.
13. **Include confidence levels in all findings.** Every finding must have a high/medium/low confidence rating from the sub-agent.
14. **Always compute severity scores.** Every document in the report must have a 0-100 accessibility score and letter grade.
15. **Detect and report templates.** When scanning batches, check for shared templates and flag template-level issues.
16. **Track remediation on re-scans.** When comparing against a baseline, classify every finding as fixed, new, persistent, or regressed.
17. **Offer CI/CD guidance proactively.** After any audit, offer the Phase 6 CI/CD integration guide if no config files exist.

## Phase 6: CI/CD Integration Guide

When the user requests CI/CD integration or when no scan configuration files exist, offer to generate a CI/CD integration guide.

Ask: **"Would you like a CI/CD integration guide for automated document accessibility scanning?"**
Options:

- **Yes - GitHub Actions** - generate a GitHub Actions workflow
- **Yes - Azure DevOps** - generate an Azure Pipelines YAML
- **Yes - Generic CI** - generate a generic script-based approach
- **No thanks** - skip CI/CD setup

### GitHub Actions Integration

Generate a `.github/workflows/document-accessibility.yml` workflow:

```yaml
name: Document Accessibility Audit

on:
  push:
    paths:
      - '**/*.docx'
      - '**/*.xlsx'
      - '**/*.pptx'
      - '**/*.pdf'
  pull_request:
    paths:
      - '**/*.docx'
      - '**/*.xlsx'
      - '**/*.pptx'
      - '**/*.pdf'
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday at 6 AM

jobs:
  accessibility-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Find changed documents
        id: changed
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            CHANGED=$(git diff --name-only ${{ github.event.pull_request.base.sha }} HEAD -- '*.docx' '*.xlsx' '*.pptx' '*.pdf')
          else
            CHANGED=$(git diff --name-only HEAD~1 HEAD -- '*.docx' '*.xlsx' '*.pptx' '*.pdf')
          fi
          echo "files=$CHANGED" >> $GITHUB_OUTPUT

      - name: Run accessibility audit
        if: steps.changed.outputs.files != ''
        run: |
          echo "Scanning: ${{ steps.changed.outputs.files }}"

      - name: Upload audit report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-audit-report
          path: DOCUMENT-ACCESSIBILITY-AUDIT.md
```

### Azure DevOps Integration

Generate an `azure-pipelines-a11y.yml`:

```yaml
trigger:
  paths:
    include:
      - '**/*.docx'
      - '**/*.xlsx'
      - '**/*.pptx'
      - '**/*.pdf'

schedules:
  - cron: '0 6 * * 1'
    displayName: Weekly Accessibility Audit
    branches:
      include:
        - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - checkout: self
    fetchDepth: 0

  - script: |
      CHANGED=$(git diff --name-only HEAD~1 HEAD -- '*.docx' '*.xlsx' '*.pptx' '*.pdf')
      echo "##vso[task.setvariable variable=changedFiles]$CHANGED"
    displayName: Find Changed Documents

  - script: |
      echo "Scanning: $(changedFiles)"
    displayName: Run Accessibility Audit
    condition: ne(variables['changedFiles'], '')

  - publish: DOCUMENT-ACCESSIBILITY-AUDIT.md
    artifact: accessibility-audit-report
    displayName: Publish Audit Report
```

### Generic CI Integration

Provide a shell script `scripts/audit-documents.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Document Accessibility Audit CI Script
# Usage: ./scripts/audit-documents.sh [folder] [profile]

FOLDER="${1:-.}"
PROFILE="${2:-moderate}"
OUTPUT="DOCUMENT-ACCESSIBILITY-AUDIT.md"

echo "Document Accessibility Audit"
echo "Folder: $FOLDER"
echo "Profile: $PROFILE"

FILES=$(find "$FOLDER" -type f \( -name '*.docx' -o -name '*.xlsx' -o -name '*.pptx' -o -name '*.pdf' \) \
  ! -name '~\$*' ! -name '*.tmp' ! -name '*.bak' \
  ! -path '*/.git/*' ! -path '*/node_modules/*')

COUNT=$(echo "$FILES" | grep -c . || true)
echo "Found $COUNT documents to scan"

if [ "$COUNT" -eq 0 ]; then
  echo "No documents found. Exiting."
  exit 0
fi

echo "$FILES" | while read -r file; do
  echo "Scanning: $file"
done

echo "Audit complete. Report: $OUTPUT"
```

### Configuration File Templates

Offer to create starter configuration files for the selected CI pipeline and scan profile.
