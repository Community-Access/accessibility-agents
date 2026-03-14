---
name: review-live-regions
description: Live region and dynamic content announcement specialist. Reviews notifications, toasts, loading states, AJAX updates, form feedback, and any content that changes without page reload.
mode: agent
agent: live-region-controller
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Live Region Review

Review dynamic content updates and ensure screen reader users are notified of changes using aria-live regions.

## Component to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Identify Dynamic Content

Ask the user:

1. **Update type** -- Search results, notifications, toasts, loading states, form feedback, chat messages, counters?
2. **Frequency** -- Frequent updates (every second) or occasional (user action)?
3. **Importance** -- Critical alerts, informational updates, decorative changes?
4. **Framework** -- React, Vue, vanilla JS, toast library (react-hot-toast, sonner)?

### Step 2: Classify Update Urgency

**Assertive (interrupts screen reader):**

- Error messages
- Critical alerts
- Time-sensitive notifications
- Form submission failures

**Polite (waits for pause):**

- Success messages
- Loading state changes
- Search result counts
- Non-critical updates

**Off (not announced):**

- Decorative animations
- Progress bars (use aria-valuenow instead)
- Content user hasn't interacted with yet

### Step 3: Check Live Region Implementation

**For toasts/notifications:**

```jsx
<div role="status" aria-live="polite" aria-atomic="true">
  Toast message here
</div>
```

**For errors:**

```jsx
<div role="alert" aria-live="assertive" aria-atomic="true">
  Error message here
</div>
```

**For status updates:**

```jsx
<div role="status" aria-live="polite">
  Loading... 5 of 20 items loaded
</div>
```

### Step 4: Check aria-atomic

- `aria-atomic="true"` -- Announce entire region
- `aria-atomic="false"` -- Announce only changed nodes

### Step 5: Check Focus Management

For interactive updates like form errors:

1. **aria-live announces** message
2. **Focus moves** to first error input (optional)
3. **aria-describedby** links error to input

### Step 6: Check Common Pitfalls

1. **Late injection** -- Live region must exist before content changes
2. **Too frequent** -- Don't spam screen reader with updates
3. **Empty then fill** -- aria-live only announces changes, not initial content
4. **Conflicting roles** -- Don't combine role="alert" with aria-live="polite"

### Step 7: Provide Remediation

For each dynamic update:

- Current implementation (if any)
- Urgency classification (assertive/polite/off)
- Live region pattern to use
- Code example with framework integration
- Screen reader testing notes

## Expected Output

- Dynamic content inventory
- Live region urgency classification
- Implementation assessment
- Missing aria-live annotations flagged
- Code fixes with framework-specific examples
