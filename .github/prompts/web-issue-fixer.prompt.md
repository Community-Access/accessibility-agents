---
name: fix-web-issues
description: Web accessibility fix applier. Handles auto-fixable issues (missing alt, lang, labels, tabindex) and presents human-judgment fixes for approval. Framework-specific code generation.
mode: agent
agent: web-issue-fixer
tools:
  - askQuestions
  - readFile
  - replaceStringInFile
  - multiReplaceStringInFile
  - runInTerminal
  - getTerminalOutput
---

# Web Accessibility Issue Fixer

Apply accessibility fixes to web source code. Auto-fix safe changes, present human-judgment items for approval with framework-specific code.

## Audit Report

**Input:** `${input:auditFile}` (WEB-ACCESSIBILITY-AUDIT.md or audit JSON)

## Instructions

### Step 1: Load Audit Report

Parse findings from audit report:

- Rule ID (axe-core or custom)
- Severity/Impact
- Affected elements (selectors)
- Current state
- Suggested fix
- Auto-fix classification

### Step 2: Detect Framework

Check workspace for:

- React: `package.json` with `react` dependency, `.jsx/.tsx` files
- Vue: `package.json` with `vue` dependency, `.vue` files
- Angular: `angular.json`, `.component.ts` files
- Svelte: `package.json` with `svelte` dependency, `.svelte` files
- Vanilla: No framework, `.html/.js/.css` files

### Step 3: Group Fixes by Category

**Auto-fixable (high confidence):**

- Missing `lang` attribute on `<html>`
- Missing `alt` on images (use filename as placeholder)
- Positive `tabindex` → `tabindex="0"` or remove
- Missing form labels (wrap input with label)

**Human judgment required:**

- Ambiguous link text (needs context)
- Color contrast (requires color picker)
- ARIA role conflicts (needs architectural decision)
- Missing alt text (needs descriptive text from user)

### Step 4: Apply Auto-Fixes

**Example: Add lang attribute**

React:

```jsx
// Old: <html>
// New:
<html lang="en">
```

HTML:

```html
<!-- Old: <!DOCTYPE html><html> -->
<!-- New: -->
<!DOCTYPE html>
<html lang="en">
```

**Example: Fix positive tabindex**

```jsx
// Old: <button tabindex="1">
// New:
<button>
```

**Example: Add missing form label**

React:

```jsx
// Old:
<input type="text" name="email" />

// New:
<label>
  Email
  <input type="text" name="email" />
</label>
```

Apply via `multiReplaceStringInFile`.

### Step 5: Present Human-Judgment Fixes

```markdown
## Fix #1: Missing Alt Text

**File:** src/components/Hero.tsx  
**Line:** 42  
**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content

**Current Code:**
```tsx
<img src="/hero-banner.jpg" />
```

**Image Analysis:** Banner image showing team collaboration in modern office

**Suggested Fix:**

```tsx
<img src="/hero-banner.jpg" alt="Team collaboration in modern office" />
```

**Accept this fix?** (yes/no/edit)

```html

If user says "edit", ask for custom alt text.

### Step 6: Handle Framework-Specific Patterns

**React:**
- Use `className` not `class`
- Self-closing tags: `<img />`, `<input />`
- Event handlers: `onClick`, `onKeyDown`

**Vue:**
- Use `:aria-label` for bound attributes
- `v-if` visibility vs `hidden` attribute
- `<img>` may use `v-bind:alt`

**Angular:**
- `[attr.aria-label]` for binding
- `(click)` event binding
- Component templates may be in separate `.html`

**Svelte:**
- `{#if}` blocks
- Event handlers: `on:click`
- Bindings: `bind:value`

### Step 7: Validate Fixes

After applying:
- Run linter: `npm run lint` or `eslint`
- Check syntax errors
- Run dev server: `npm run dev`
- Quick visual check

### Step 8: Re-Run Audit

Invoke axe-core scan on fixed pages:
```bash
npx @axe-core/cli ${url} --tags wcag2a,wcag2aa
```

Verify issues resolved.

### Step 9: Generate Fix Report

Create `WEB-FIX-REPORT.md`:

```markdown
# Web Accessibility Fix Report

**Generated:** ${date}  
**Framework:** ${framework}  
**Files Fixed:** ${fileCount}

## Auto-Fixes Applied (${autoFixCount})

### Missing Lang Attributes (${langCount})
- src/App.tsx: Added `lang="en"` to `<html>`

### Positive Tabindex Removed (${tabindexCount})
- src/components/Modal.tsx: Removed `tabindex="1"` from 3 buttons

### Missing Form Labels (${labelCount})
- src/components/ContactForm.tsx: Wrapped 5 inputs with `<label>`

## Human-Judgment Fixes (${humanCount})

### Missing Alt Text (${altCount})
- src/components/Hero.tsx: Added descriptive alt text to banner image
- src/components/Features.tsx: Marked decorative images with empty alt

### Color Contrast Fixed (${contrastCount})
- src/styles/theme.ts: Updated muted color from #6c757d to #5a6268

## Before/After Validation

- **Before:** ${beforeViolations} violations
- **After:** ${afterViolations} violations
- **Fixed:** ${fixedCount} issues ✅

## Remaining Issues

- ${remainingCount} issues still require manual intervention
```

## Expected Output

- Auto-fixes applied with framework-specific syntax
- Human-judgment fixes presented for approval
- Fix report with before/after validation
- Code re-scanned to verify fixes
