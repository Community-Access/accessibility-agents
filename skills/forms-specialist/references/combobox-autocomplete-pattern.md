# Forms Specialist reference: Combobox / Autocomplete Pattern

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Combobox / Autocomplete Pattern

Per the W3C APG Combobox Pattern, a combobox is an input with an associated popup (listbox, grid, tree, or dialog) that helps the user set the value.

### Two Types

- **Editable combobox:** User can type any value; popup filters suggestions (e.g., address autocomplete)
- **Select-only combobox:** User selects from a predefined list; typing filters options (custom styled `<select>` replacement)

### Required Structure

```html
<label for="city">City</label>
<input id="city" role="combobox" type="text"
  aria-expanded="false"
  aria-controls="city-listbox"
  aria-autocomplete="list"
  autocomplete="off">
<ul id="city-listbox" role="listbox" hidden>
  <li role="option" id="city-1">Austin</li>
  <li role="option" id="city-2">Boston</li>
  <li role="option" id="city-3">Chicago</li>
</ul>
<div aria-live="polite" class="visually-hidden" id="city-status"></div>
```

### Autocomplete Behaviors

Each aria-autocomplete, with its behavior.

| `aria-autocomplete` | Behavior |
|---------------------|----------|
| `none` | Popup shows all options regardless of input |
| `list` | Popup filters to match input text |
| `both` | Popup filters AND inline completion appears in the input |
| `inline` | Only inline completion, no popup |

### Key Requirements (W3C APG)

- Use `aria-controls` (NOT `aria-owns`) to link the input to the popup
- `aria-expanded` toggles `true`/`false` as popup opens/closes
- DOM focus stays on the input; use `aria-activedescendant` to track the highlighted option
- Arrow Down opens the popup and moves to the first option
- Escape closes the popup without changing the value
- Enter accepts the highlighted option
- Live region announces result count: "3 cities match. Use arrow keys to navigate"
- Set `autocomplete="off"` on the input to prevent browser autocomplete from conflicting

## Accessible Authentication (WCAG 3.3.8) {#accessible-auth}

Authentication must not require cognitive function tests (memorizing passwords, transcribing codes, solving puzzles) unless an alternative method is available.

### Requirements

- **Never block paste** in password fields. Users depend on password managers
- **Support password managers:** use correct `autocomplete` attributes (`current-password`, `new-password`, `username`)
- **Provide show/hide password toggle** so users can verify what they typed
- **Support alternative auth:** passkeys/WebAuthn, biometrics, OAuth/social login, email/SMS magic links
- **Two-factor/verification codes:** the input field must support paste so users can paste from authenticator apps or SMS
- **CAPTCHAs** are a cognitive function test. If used, provide an alternative (audio CAPTCHA, email verification, or invisible reCAPTCHA)

```html
<!-- Password field that supports password managers -->
<label for="password">Password</label>
<input id="password" type="password" autocomplete="current-password">
<button type="button" aria-label="Show password" aria-pressed="false">Show</button>

<!-- Verification code that supports paste -->
<label for="code">Verification code</label>
<input id="code" type="text" inputmode="numeric" autocomplete="one-time-code"
  aria-describedby="code-help">
<p id="code-help">Enter the 6-digit code sent to your phone</p>
```
