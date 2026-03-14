# PDF Form to Accessible HTML Converter

## Overview

The `convert_pdf_form_to_html` MCP tool extracts AcroForm fields from a PDF and generates a fully accessible HTML5 form. It maps each PDF field type to semantically correct HTML elements with proper labels, fieldsets, ARIA attributes, and keyboard-friendly styling.

## How It Works

1. Reads the PDF file using **pdf-lib** (MIT license, pure JavaScript, no native dependencies)
2. Extracts all AcroForm fields with their types, names, options, default values, and flags
3. Derives human-readable labels from field names (splits camelCase, replaces underscores)
4. Generates an accessible HTML5 form with proper structure

## Field Type Mapping

| PDF Field Type | pdf-lib Class | HTML Output |
|---------------|---------------|-------------|
| Text (single-line) | `PDFTextField` | `<input type="text">` with `<label>` |
| Text (multiline) | `PDFTextField` (multiline flag) | `<textarea>` with `<label>` |
| Checkbox | `PDFCheckBox` | `<input type="checkbox">` with `<label>` |
| Radio group | `PDFRadioGroup` | `<fieldset>` + `<legend>` + `<input type="radio">` per option |
| Dropdown | `PDFDropdown` | `<select>` with `<option>` elements |
| Multi-select list | `PDFOptionList` | `<select multiple>` with `<option>` elements |
| Button | `PDFButton` | `<button type="button">` |
| Signature | `PDFSignature` | Placeholder paragraph with instructions |

## Accessibility Features in Generated HTML

- Every input has an associated `<label>` with matching `for`/`id` binding
- Radio button groups wrapped in `<fieldset>` with `<legend>`
- Required fields marked with `aria-required="true"` and a visual asterisk indicator
- Read-only fields use the `readonly` attribute with a visible "(read-only)" notice
- Focus styles with 2px solid outline and offset for keyboard navigation
- Input borders at 4.6:1 contrast ratio against white backgrounds
- Responsive layout with `max-width: 40rem` and proper font sizing
- Submit button meets 44x44px minimum touch target area

## Usage

```text
# Claude Code
convert_pdf_form_to_html filePath="forms/application.pdf" title="Job Application"

# Copilot Chat
@document-accessibility-wizard convert the enrollment PDF form to accessible HTML
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | Yes | Path to the PDF file containing form fields |
| `title` | string | No | Title for the generated HTML page (default: filename) |

## Example Output

For a PDF with 3 text fields, 1 checkbox, and 1 dropdown, the tool generates:

```html
PDF FORM CONVERSION: application.pdf
Fields extracted: 5 (text: 3, checkbox: 1, select: 1)

--- ACCESSIBLE HTML OUTPUT ---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Job Application</title>
  ...
</head>
<body>
  <h1>Job Application</h1>
  <form action="#" method="post" novalidate>
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input type="text" id="firstName" name="firstName">
    </div>
    ...
  </form>
</body>
</html>

--- FIELD INVENTORY ---

- firstName (text)
- lastName (text)
- email (text)
- agreeToTerms (checkbox)
- department (select) [5 options]
```

## Limitations

| Form Type | Support Level | Notes |
|-----------|--------------|-------|
| Standard AcroForm | Full | Text, checkbox, radio, dropdown, multi-select, button |
| AcroForm with JavaScript actions | Partial | Fields extracted; calculated/validation JS requires manual review |
| XFA forms (XML Forms Architecture) | Not supported | Entirely different format; some government forms use this |
| Flattened forms | Not supported | Fields baked into content stream; no extractable data |
| Encrypted PDFs | Attempted | `ignoreEncryption: true` flag; may fail if fully locked |

## Security

- **Path validation**: Files must be within the user's home directory or current working directory
- **Symlink resolution**: Symlinks are followed and re-validated to prevent traversal
- **File size limit**: 100 MB maximum to prevent memory exhaustion
- **HTML escaping**: All field names, labels, and values are HTML-escaped to prevent XSS
- **No code execution**: PDF JavaScript actions are not executed or converted

## Installation

```bash
npm install pdf-lib
```

pdf-lib is a pure JavaScript library with zero native dependencies. It works on all platforms.

## Connections

| Connect to | When |
|------------|------|
| [pdf-accessibility](../agents/pdf-accessibility.md) | Scan the source PDF for accessibility issues before conversion |
| [forms-specialist](../agents/forms-specialist.md) | Review the generated HTML form for additional accessibility improvements |
| [web-issue-fixer](../agents/web-issue-fixer.md) | Apply fixes to the generated HTML if issues are found |
