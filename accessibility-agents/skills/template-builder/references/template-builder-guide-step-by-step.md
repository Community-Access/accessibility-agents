# Template Builder reference: Template Builder Guide: Step-by-Step

Part of the `template-builder` skill. Read this only when the task reaches these sections.

## Template Builder Guide: Step-by-Step

### Phase 1: Gather Template Metadata

The agent starts by asking core questions about your template:

**Questions:**

- What is the template name? (e.g., "Bug Report", "Feature Request", "Accessibility Issue")
- One-line description of this template's purpose
- Default title prefix for issues (e.g., "[BUG]", "[A11Y]", "[FEAT]")
- What labels should this template auto-apply? (comma-separated)

**Agent generates:**

```yaml
name: Your Template Name
description: Your description
title: "[TAG] "
labels: ["label1", "label2"]
```

---

### Phase 2: Build Form Fields Interactively

The agent walks through adding fields one-by-one:

**Questions for each field:**

1. Field type? -> Show options:
   - `markdown` (instructional text)
   - `input` (single-line text)
   - `textarea` (multi-line text)
   - `dropdown` (select from options)
   - `checkboxes` (multiple selections)

2. Field label? (required)
3. Help text / description? (optional)
4. Is this field required? (yes/no)
5. For `textarea`: Should code highlighting be enabled? (markdown, python, javascript, etc.)
6. For `dropdown`: What are the options? (comma-separated or one per line)
7. For `dropdown`: Can user select multiple? (yes/no)
8. Another field? (yes/no)

**Agent generates field YAML:**

```yaml
  - type: dropdown
    id: screen-reader
    attributes:
      label: Screen Reader
      description: Which screen reader are you using?
      options:
        - NVDA
        - JAWS
        - VoiceOver
    validations:
      required: true
```

---

### Phase 3: Generate Complete Template

Once all fields are entered, the agent:

1. **Asks for final review:**
   - "Does this capture all the information you need?"
   - "Any fields to reorder or remove?"

2. **Generates the complete YAML:**
   - Full frontmatter with all metadata
   - All fields in order
   - Proper validation setup
   - Formatted and ready to copy

3. **Provides usage instructions:**
   - Where to save the file (.github/ISSUE_TEMPLATE/your-name.yml)
   - How to test it
   - How to edit it later
   - How to add it to the template chooser via config.yml

---
