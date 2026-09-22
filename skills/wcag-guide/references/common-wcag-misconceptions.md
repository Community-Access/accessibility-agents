# WCAG Guide reference: Common WCAG Misconceptions

Part of the `wcag-guide` skill. Read this only when the task reaches these sections.

## Common WCAG Misconceptions

### "WCAG only applies to screen reader users"

**False.** WCAG covers four groups of disabilities: visual (blindness, low vision, color blindness), auditory (deafness, hard of hearing), motor (tremors, limited reach, paralysis), and cognitive (dyslexia, memory, attention). Most criteria help multiple groups.

### "If axe gives us a clean report, we're WCAG compliant"

**False.** Automated tools catch roughly 30% of WCAG criteria. The remaining 70% require manual testing - correct tab order, meaningful alt text, logical focus management, screen reader announcements.

### "alt text should describe what the image looks like"

**Partially true.** Alt text should describe the image's **purpose in context**. A photo of a CEO on an "About Us" page: "Jane Smith, CEO." Same photo on a news article: "Jane Smith announcing the merger at the 2025 keynote." Same photo used as decoration: `alt=""`.

### "ARIA makes things accessible"

**Opposite.** The First Rule of ARIA: don't use ARIA if you can use native HTML. ARIA overrides semantics - it doesn't add functionality. A `<div role="button">` is announced as a button but doesn't respond to Enter/Space, doesn't appear in the tab order, and requires manual ARIA state management. A `<button>` does all of that natively.

### "We'll add accessibility at the end"

**Disastrous.** Retrofitting accessibility is 10-100x more expensive than building it in. It often requires architectural changes (DOM order, state management, component structure) that are painful after the fact.

### "Disabled controls don't need to be accessible"

**Complicated.** WCAG doesn't require disabled controls to be perceivable, but users still need to know they exist and why they're disabled. Best practice: keep disabled controls visible and provide a reason ("Submit disabled - please fix 2 errors above").

### "We target mobile, so WCAG doesn't apply"

**False.** WCAG applies to all web content regardless of device. Mobile web apps must meet the same criteria. Touch targets (2.5.8), orientation (1.3.4), and gesture alternatives (2.5.1) are especially relevant on mobile.

---
