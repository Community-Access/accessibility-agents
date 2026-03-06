---
name: build-template
description: Interactive guided wizard for creating GitHub issue templates, PR templates, and discussion templates. Get production-ready YAML templates with no manual YAML writing.
mode: agent
agent: template-builder
tools:
  - askQuestions
  - createFile
  - readFile
---

# Template Builder

Interactive wizard for creating GitHub issue templates, PR templates, and discussion templates. No YAML knowledge required.

## Template Type

**Type:** `${input:templateType}` (issue, pull_request, discussion)

## Instructions

### Step 1: Ask Template Purpose

Questions:
- What type of issue/PR is this template for? (bug, feature, documentation, security, accessibility)
- Who will use this template? (users, contributors, maintainers)
- What information do you need to collect?

### Step 2: Build Template Interactively

For each field:
- Label (user-facing name)
- Description (help text)
- Type (input, textarea, dropdown, checkboxes)
- Required or optional
- Default value (if applicable)
- Validation rules (if applicable)

### Step 3: Generate Issue Template

Create `.github/ISSUE_TEMPLATE/${name}.yml`:

```yaml
name: ${displayName}
description: ${description}
title: "[${prefix}]: "
labels: [${labels}]
assignees: [${assignees}]
body:
  - type: markdown
    attributes:
      value: |
        ${introductionText}
  
  - type: input
    id: ${fieldId}
    attributes:
      label: ${fieldLabel}
      description: ${fieldDescription}
      placeholder: ${placeholder}
    validations:
      required: ${true/false}
  
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Detailed description
      placeholder: Describe the issue...
    validations:
      required: true
  
  - type: dropdown
    id: ${fieldId}
    attributes:
      label: ${label}
      options:
        - Option 1
        - Option 2
        - Option 3
    validations:
      required: true
  
  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have searched existing issues
          required: true
        - label: I have read the contributing guide
          required: false
```

### Step 4: Generate Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description

<!-- Describe your changes in detail -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Accessibility improvement

## Testing

<!-- How have you tested these changes? -->

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally

## Accessibility

- [ ] I have reviewed accessibility implications
- [ ] Screen reader tested (if UI changes)
- [ ] Keyboard navigation tested

## Related Issues

<!-- Link to related issues: fixes #123, related to #456 -->
```

### Step 5: Generate Discussion Template

Create `.github/DISCUSSION_TEMPLATE/${name}.yml`:

```yaml
title: ${defaultTitle}
labels: [${labels}]
body:
  - type: markdown
    attributes:
      value: |
        ${introductionText}
  
  - type: textarea
    id: topic
    attributes:
      label: Topic
      description: What would you like to discuss?
    validations:
      required: true
  
  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Any additional information
    validations:
      required: false
```

### Step 6: Validate Template

Check YAML syntax and required fields.

### Step 7: Provide Usage Instructions

```markdown
## Template Created

✅ ${filePath}

## How to Use

**Users:**
- Go to repository Issues → New Issue
- Select your template from the list
- Fill out the form

**Testing:**
- Open new issue to preview template
- Verify all fields appear correctly
- Check required field validation
```

## Expected Output

- Generated template file(s)
- YAML syntax validated
- Usage instructions provided
- Example issue/PR using template
