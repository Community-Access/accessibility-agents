# Live Region Controller reference: Politeness Levels

Part of the `live-region-controller` skill. Read this only when the task reaches these sections.

## Politeness Levels

### `aria-live="polite"` (use for almost everything)

The screen reader waits until it finishes its current announcement, then reads the update. Does not interrupt.

Use for:

- Search result counts ("5 results available")
- Filter updates ("Showing 12 of 48 items")
- Form success messages ("Changes saved")
- Content loaded ("Comments loaded")
- Sort order changes ("Sorted by date, newest first")
- Pagination ("Page 2 of 5")
- Non-critical status changes ("Connected", "Synced")

### `aria-live="assertive"` (use rarely)

The screen reader interrupts whatever it is currently reading to announce the update immediately.

Use ONLY for:

- Error messages that require immediate attention ("Session expired, please log in again")
- Critical alerts ("Unsaved changes will be lost")
- Time-sensitive warnings ("Connection lost")

Never use assertive for routine updates. Interrupting the screen reader is disorienting. If you are unsure, use polite.

### `role="status"`

Implicit `aria-live="polite"`. Use for status indicators that update frequently.

```html
<div role="status">5 items in cart</div>
```

### `role="alert"`

Implicit `aria-live="assertive"`. Use for error conditions.

**Per W3C APG Alert Pattern:**

- Alerts must not affect keyboard focus -- never move focus to an alert
- Alerts that are present in the DOM when the page loads are NOT announced -- the screen reader's own page load announcement takes precedence
- Avoid alerts that automatically disappear: users may not have time to read them (WCAG 2.2.3 No Timing, 2.2.4 Interruptions)
- Avoid firing alerts too frequently -- each one interrupts the user's current task

```html
<div role="alert">Payment failed. Please try again.</div>
```

### `role="log"`

Implicit `aria-live="polite"`. Use for sequential content where new entries are added (chat, activity feeds, console output).

```html
<div role="log" aria-label="Chat messages">
  <!-- new messages append here -->
</div>
```

### `role="timer"`

Use for elements displaying elapsed or remaining time. Does NOT imply `aria-live` -- add it explicitly if you want announcements.

```html
<div role="timer" aria-live="off" aria-label="Session timeout">4:59 remaining</div>
```

Typically keep `aria-live="off"` to prevent constant interruption, and announce milestones separately via a polite live region.

### The `<output>` Element

The HTML `<output>` element has an implicit `role="status"` (polite live region). Use it for calculation results or form output:

```html
<output for="qty price" aria-label="Total cost">$24.00</output>
```

### Live Region Attribute Reference

**`aria-atomic`** -- Controls whether the screen reader announces the entire region or just the changed portion:

- `aria-atomic="true"` -- announce the ENTIRE region content on any change (use for status messages where context matters: "3 of 10 items")
- `aria-atomic="false"` (default) -- announce only the changed nodes (use for chat logs where only the new message matters)

**`aria-relevant`** -- Controls which types of changes trigger announcements:

- `additions` (default for most roles) -- new nodes added
- `removals` -- nodes removed (rare; use for "user left the chat" scenarios)
- `text` -- text content changed
- `all` -- shorthand for `additions removals text`
- `additions text` (default) -- most common; new nodes and text changes

**`aria-busy`** -- Suppress announcements during batch updates:

```javascript
// Start batch update
regionEl.setAttribute('aria-busy', 'true');

// Apply multiple DOM changes...
items.forEach(item => regionEl.appendChild(createItemEl(item)));

// End batch update -- screen reader now announces the final state
regionEl.setAttribute('aria-busy', 'false');
```

Without `aria-busy`, the screen reader may announce intermediate states during rapid multi-step updates.

## Implementation Rules

### The Region Must Exist First

The live region element must be in the DOM BEFORE content changes. If you create the element and set its content at the same time, the screen reader will not announce it.

```html
<!-- GOOD: Region exists on page load, content updated later -->
<div aria-live="polite" id="search-status"></div>

<script>
// Later, when results load:
document.getElementById('search-status').textContent = '5 results available';
</script>
```

```html
<!-- BAD: Region created and filled simultaneously -->
<script>
const status = document.createElement('div');
status.setAttribute('aria-live', 'polite');
status.textContent = '5 results available';
document.body.appendChild(status); // Screen reader may not announce this
</script>
```

### Update Text Content, Do Not Replace Elements

Changing `textContent` or `innerText` triggers the announcement. Replacing the entire element may not.

```javascript
// GOOD
statusEl.textContent = '3 results available';

// BAD -- may not trigger announcement
statusEl.innerHTML = '<span>3 results available</span>';

// BAD -- replacing the element entirely
oldStatusEl.replaceWith(newStatusEl);
```

### Keep Announcements Short

The screen reader reads the entire content of the live region when it changes. Long announcements are disorienting.

```javascript
// GOOD
statusEl.textContent = '5 results';

// BAD
statusEl.textContent = 'Your search for "accessibility" returned 5 results. Please review the results below and refine your search if needed.';
```

### Do Not Announce Too Frequently

If content updates rapidly (typing in search, dragging a slider), debounce the announcements.

```javascript
let debounceTimer;
function announceResults(count) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    statusEl.textContent = `${count} results`;
  }, 500); // Wait 500ms after last change
}
```

Without debouncing, the screen reader will try to announce every intermediate value, creating garbled overlapping speech.

### Visually Hidden Live Regions

If the announcement should not be visible on screen, use the visually-hidden pattern:

```html
<div aria-live="polite" class="visually-hidden" id="screen-reader-status"></div>
```

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Never use `display: none` or `visibility: hidden` on live regions. Screen readers ignore hidden elements entirely.

## Common Patterns

### Search/Filter Results

```html
<div aria-live="polite" id="result-count" class="visually-hidden"></div>

<script>
const count = filteredResults.length;
document.getElementById('result-count').textContent = 
  count === 0 ? 'No results found' : `${count} results`;
</script>
```

### Loading States

```html
<div aria-live="polite" id="loading-status"></div>

<script>
// Start loading
loadingStatus.textContent = 'Loading...';

// Finish loading
loadingStatus.textContent = 'Content loaded';
</script>
```

For operations over 2 seconds, announce that loading is happening. Do not leave the user in silence.

### Form Submission

```html
<div aria-live="polite" id="form-status"></div>

<script>
// Success
formStatus.textContent = 'Changes saved';

// Error
formStatus.setAttribute('role', 'alert');
formStatus.textContent = 'Error: Email address is invalid';
</script>
```

### Toast Notifications

```html
<div aria-live="polite" id="toast-container"></div>

<script>
function showToast(message) {
  toastContainer.textContent = message;
  setTimeout(() => {
    toastContainer.textContent = '';
  }, 5000);
}
</script>
```

- Never move focus to a toast
- Use polite, not assertive
- Keep message brief
- Do not stack multiple toasts rapidly

### Progress Indicators

```html
<div role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress">
  45%
</div>
<div aria-live="polite" id="progress-status" class="visually-hidden"></div>

<script>
function updateProgress(percent) {
  progressBar.setAttribute('aria-valuenow', percent);
  progressBar.textContent = `${percent}%`;
  
  // Announce milestones, not every percentage
  if (percent === 25 || percent === 50 || percent === 75) {
    progressStatus.textContent = `${percent}% complete`;
  } else if (percent === 100) {
    progressStatus.textContent = 'Upload complete';
  }
}
</script>
```

### Inline Editing

```html
<div aria-live="polite" id="save-status" class="visually-hidden"></div>

<script>
saveStatus.textContent = 'Saved';
// Clear after a moment so next save triggers a fresh announcement
setTimeout(() => { saveStatus.textContent = ''; }, 1000);
</script>
```
