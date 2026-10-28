# Forms Specialist reference: Required Fields

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Required Fields

```html
<label for="name">Full name <span aria-hidden="true">*</span></label>
<input id="name" type="text" required aria-required="true">
```

Requirements:

- Use the native `required` attribute -- it gives browser validation and screen reader announcement for free
- Add `aria-required="true"` for reinforcement (some screen readers prefer it)
- If using an asterisk, hide it from screen readers with `aria-hidden="true"` -- the `required` attribute already announces "required"
- Explain the asterisk convention at the top of the form: "Fields marked with * are required"
- Never indicate required status through color alone

## Grouping with Fieldset and Legend

Related inputs MUST be grouped:

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input id="street" type="text" autocomplete="street-address">
  <label for="city">City</label>
  <input id="city" type="text" autocomplete="address-level2">
</fieldset>
```

When to use fieldset/legend:

- Radio button groups (always)
- Checkbox groups (always)
- Related field groups (address, payment info, personal details)
- When the group label provides essential context for understanding individual fields

```html
<!-- Radio buttons -- fieldset is mandatory -->
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
  <label><input type="radio" name="contact" value="text"> Text message</label>
</fieldset>

<!-- Checkboxes -- fieldset is mandatory -->
<fieldset>
  <legend>Notification preferences</legend>
  <label><input type="checkbox" name="notify" value="updates"> Product updates</label>
  <label><input type="checkbox" name="notify" value="news"> Newsletter</label>
  <label><input type="checkbox" name="notify" value="offers"> Special offers</label>
</fieldset>
```

Without fieldset/legend, a screen reader user hearing "Email" has no idea it refers to a contact method preference.

## Error Handling

This is the most commonly broken part of form accessibility.

### Error Message Structure

```html
<label for="email">Email address</label>
<input id="email" type="email" aria-describedby="email-error" aria-invalid="true">
<p id="email-error" role="alert">Please enter a valid email address.</p>
```

Requirements:

- `aria-invalid="true"` on the field with an error
- Error message linked via `aria-describedby`
- Error text is visible (not just an icon or color change)
- Error text is specific: "Please enter a valid email address" not "Invalid input"
- Remove `aria-invalid` when the error is corrected

### Error Summary on Submit

For forms with multiple errors, provide a summary at the top:

```html
<div role="alert" id="error-summary" tabindex="-1">
  <h2>There are 3 errors in this form</h2>
  <ul>
    <li><a href="#email">Email address: Please enter a valid email</a></li>
    <li><a href="#phone">Phone number: Please include area code</a></li>
    <li><a href="#zip">ZIP code: Must be 5 digits</a></li>
  </ul>
</div>
```

Requirements:

- `role="alert"` so screen readers announce it immediately
- `tabindex="-1"` so focus can be moved there programmatically
- Focus moves to the error summary on submit
- Each error links to the offending field
- Heading describes the count of errors

### Focus Management on Error

```javascript
// On form submit with errors:
const errorSummary = document.getElementById('error-summary');
errorSummary.focus(); // Focus the summary

// If no summary, focus the first invalid field:
const firstError = document.querySelector('[aria-invalid="true"]');
firstError.focus();
```

### Inline Validation

If validating as the user types or on blur:

- Do not validate on every keystroke -- wait for blur or a pause
- Announce errors via `aria-live="polite"` or `aria-describedby` association
- Remove errors immediately when corrected
- Never block input while validating

### Error Indicators

- Red border alone is NOT sufficient
- Must include visible error text
- Should include an icon for additional visual indicator
- Associate the error icon with `aria-hidden="true"` (the text conveys the message)

```html
<!-- GOOD: Text + icon + color -->
<p id="email-error" role="alert">
  <svg aria-hidden="true" class="error-icon">...</svg>
  Please enter a valid email address.
</p>

<!-- BAD: Color only -->
<input class="border-red-500" type="email">
<!-- Screen reader has no idea there's an error -->
```

## Autocomplete

Use `autocomplete` attributes to help browsers and password managers fill fields:

```html
<input type="text" autocomplete="given-name">     <!-- First name -->
<input type="text" autocomplete="family-name">     <!-- Last name -->
<input type="email" autocomplete="email">          <!-- Email -->
<input type="tel" autocomplete="tel">              <!-- Phone -->
<input type="text" autocomplete="street-address">  <!-- Street -->
<input type="text" autocomplete="address-level2">  <!-- City -->
<input type="text" autocomplete="address-level1">  <!-- State/Province -->
<input type="text" autocomplete="postal-code">     <!-- ZIP/Postal code -->
<input type="text" autocomplete="country-name">    <!-- Country -->
<input type="text" autocomplete="cc-name">         <!-- Cardholder name -->
<input type="text" autocomplete="cc-number">       <!-- Card number -->
<input type="text" autocomplete="cc-exp">          <!-- Expiry -->
<input type="text" autocomplete="cc-csc">          <!-- CVV -->
<input type="password" autocomplete="new-password"> <!-- New password -->
<input type="password" autocomplete="current-password"> <!-- Login password -->
<input type="text" autocomplete="username">        <!-- Username -->
```

This is a WCAG 1.3.5 requirement (Input Purpose). It helps users with cognitive disabilities by enabling autofill and helps password managers work correctly.
