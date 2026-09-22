# Template Builder reference: Hands-On Exercise: Build Your Own Template Builder

Part of the `template-builder` skill. Read this only when the task reaches these sections.

## Hands-On Exercise: Build Your Own Template Builder

During the workshop (Chapter 16), you will extend this agent:

### Exercise 1: Generate Your Project's Template

1. Open VS Code
2. Activate Copilot Chat
3. Type: `@template-builder` + describe your project's needs
4. Follow the Ask Questions flow
5. Save the generated YAML to your fork

### Exercise 2: Add a Workflow Variant

The base agent handles general templates. Add a `security-template` or `documentation-template` variant:

1. Open the Template Builder agent definition
2. Add a new slash command: `/build-security-template`
3. Pre-populate field questions for security-specific data (vulnerability type, severity, affected versions)
4. Test it with `@template-builder` + "create security template"

### Exercise 3: Export to Markdown

Currently the agent outputs YAML. Add a follow-up step:

1. After generating YAML, ask: "Also generate a Markdown version?"
2. Convert the YAML field structure to Markdown template format
3. Output both versions so users can choose

### Exercise 4: Create a Template Showcase

Collect anonymous templates built by workshop participants:

1. Your template works - share it
2. Create a PR to `.github/community-templates/`
3. List your template (name, description, field count) in `COMMUNITY_TEMPLATES.md`
4. Other participants can reference or fork your template

---

## Technical Details: VS Code Ask Questions Integration

The Template Builder uses VS Code's Ask Questions feature to create an interactive wizard. Here's how it works internally:

### Phase 1: Initial Questions

```text
Agent asks (via Ask Questions UI):
- Template name?
  [Input field with placeholder "e.g., Bug Report"]
  
- What is this template for?
  [Text area with prompt text]
  
Accept / Cancel buttons below
```

### Phase 2: Field-by-Field Loop

```text
Agent displays:
"Add a field to your template"

[Dropdown: Select field type]
[Input: Field label]
[Textarea: Description]
[Checkbox: Required?]
[Checkbox: For textarea - enable code highlighting?]
[Dynamic input: For dropdown - add options]

[Add Another Field] [Finish]
```

### Phase 3: Review

```text
Agent shows:
"Here's your YAML template. Ready?"

[Syntax-highlighted code block]

[Copy to Clipboard] [Edit] [Save to file]
```

When the user clicks "Copy to Clipboard", the agent provides instructions:

1. Go to VS Code Explorer
2. Navigate to `.github/ISSUE_TEMPLATE/`
3. New file: `your-template-name.yml`
4. Paste the YAML
5. Save and commit

---

## Troubleshooting & Tips

### Issue: "I want to reorder my fields"

After the template is generated, ask: `@template-builder reorder fields` + paste your YAML. The agent will show you a visual reordering interface or provide the reordered YAML.

### Issue: "I want to edit just one field"

Reply to the agent: "Change field 3 to a textarea instead of input" and the agent regenerates with that one change.

### Tip: "Save time by describing your entire template at once"

Instead of using Ask Questions, you can paste a template description:

```text
@template-builder

Create a template with:
- Component dropdown (values: Agent A, Agent B, Agent C)
- Severity dropdown (required)
- Detailed description textarea
- Steps to reproduce textarea
- Before submitting: 2 checkboxes
```

The agent parses your description and generates the template.

### Tip: "Use the template for documentation too"

This agent creates GitHub issue templates, but the same pattern works for:

- PR templates (saved as `.github/pull_request_template.md`)
- Discussion templates
- GitHub Forms on custom websites

---

## Related Resources

- [GitHub issue forms syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms) - every field type and its options
- [Configuring issue templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) - chooser config and template placement
- [WCAG 2.2 Labels or Instructions (3.3.2)](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) - why every field needs a real label

---

*This agent makes template creation magical: go from idea to production-ready YAML in seconds. Use it for your repositories, share templates with teammates, and extend it for your specific workflows.*

---
