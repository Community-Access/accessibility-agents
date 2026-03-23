---
name: generate-accessibility-statement
description: Generate a conformance/accessibility statement from audit results following W3C or EU model templates. Outputs a deployable HTML or Markdown page.
mode: agent
agent: accessibility-statement
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
---

# Generate Accessibility Statement

Generate a conformance accessibility statement from existing audit results. The statement follows the W3C or EU model template and includes conformance status, known limitations, feedback mechanism, and compatibility information.

## Instructions

1. Search the workspace for existing audit reports (`WEB-ACCESSIBILITY-AUDIT.md`, `ACCESSIBILITY-AUDIT.md`, `DOCUMENT-ACCESSIBILITY-AUDIT.md`)
2. Ask the user for:
   - Organization name
   - Website URL(s)
   - Target conformance level (AA by default)
   - Statement format (W3C or EU model)
   - Contact email for accessibility feedback
   - Assessment method and date
3. Map audit findings to known limitations with workarounds
4. Classify overall conformance status (Fully / Partially / Non-conformant)
5. Generate the statement as `ACCESSIBILITY-STATEMENT.md`
6. Provide guidance on where to publish (footer link, dedicated page)
