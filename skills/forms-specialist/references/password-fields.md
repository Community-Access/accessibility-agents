# Forms Specialist reference: Password Fields

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Password Fields

```html
<label for="password">Password</label>
<div class="password-wrapper">
  <input id="password" type="password" autocomplete="new-password" aria-describedby="password-requirements">
  <button type="button" aria-label="Show password" aria-pressed="false" onclick="togglePassword()">
    <svg aria-hidden="true"><!-- eye icon --></svg>
  </button>
</div>
<p id="password-requirements">At least 8 characters, one uppercase, one number.</p>
```

Requirements:

- Show/hide toggle is a `<button>` with `aria-pressed`
- `aria-label` updates: "Show password" / "Hide password"
- Use `aria-pressed` to indicate toggle state
- Never disable paste in password fields
- Requirements text linked via `aria-describedby`
