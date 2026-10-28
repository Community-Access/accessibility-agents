# Forms Specialist reference: Custom Controls

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Custom Controls

### Toggle Switch

```html
<button role="switch" aria-checked="false" aria-label="Dark mode">
  <span aria-hidden="true" class="toggle-track">
    <span class="toggle-thumb"></span>
  </span>
</button>
```

- Use `role="switch"` with `aria-checked`
- Activate with Enter or Space
- Announce state change
- Visible on/off indicator beyond color

### Star Rating

```html
<fieldset>
  <legend>Rate this product</legend>
  <label><input type="radio" name="rating" value="1"> 1 star</label>
  <label><input type="radio" name="rating" value="2"> 2 stars</label>
  <label><input type="radio" name="rating" value="3"> 3 stars</label>
  <label><input type="radio" name="rating" value="4"> 4 stars</label>
  <label><input type="radio" name="rating" value="5"> 5 stars</label>
</fieldset>
```

Use native radio buttons, style them visually as stars. Do not build from clickable SVGs without full ARIA.
