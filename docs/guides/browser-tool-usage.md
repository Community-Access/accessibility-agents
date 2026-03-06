# Browser-Assisted Accessibility Verification

Web accessibility agents can autonomously navigate, test, and verify fixes in VS Code's integrated browser, creating a closed-loop "fix → verify → confirm" workflow.

## Overview

**Traditional workflow:**
1. Agent scans code → finds issues
2. Agent suggests fixes
3. Developer manually tests in browser
4. Developer reports back if it worked

**Browser-assisted workflow:**
1. Agent scans code → finds issues
2. Agent applies fix to code
3. **Agent opens page in integrated browser**
4. **Agent takes screenshot as evidence**
5. **Agent verifies fix worked (or detects failure)**
6. Agent reports: "Fix applied and **verified in browser**"

## Requirements

### Setting Required

Browser tools must be enabled in VS Code settings:

```json
{
  "workbench.browser.enableChatTools": true
}
```

**How to enable:**
1. Open VS Code Settings (Ctrl+,)
2. Search for "browser chat tools"
3. Check "Enable Chat Tools"

Or add to `.vscode/settings.json`:

```json
{
  "workbench.browser.enableChatTools": true
}
```

### Prerequisites

- **Dev server running** — Application must be served locally (localhost:3000, :5173, :8080, etc.)
- **VS Code 1.110+** — Browser tools are a v1.110+ feature
- **Network access** — Agent must be able to reach the dev server URL

## Available Browser Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `open_browser_page(url)` | Navigate to URL in integrated browser | `open_browser_page('http://localhost:3000')` |
| `take_screenshot(selector?)` | Capture page or specific element | `take_screenshot('.submit-button')` |
| `click_element(selector)` | Click button/link for testing | `click_element('#menu-toggle')` |
| `fill_form(data)` | Fill form fields | `fill_form({name: 'Test', email: 'test@example.com'})` |

## When Agents Use Browser Tools

### Web Accessibility Wizard (Phase 12)

After completing the audit and reporting findings, the wizard offers:

> **Would you like me to verify fixes in the integrated browser?**

If yes:
1. Detects if dev server is running (checks common ports)
2. Opens page in integrated browser
3. Takes screenshots of fixed elements
4. Invokes web-issue-fixer with browser verification context
5. Collects visual evidence
6. Reports: "Fix applied and verified in browser"

### Web Issue Fixer (Auto-Verification)

After applying each fix:
1. Takes screenshot of the affected element
2. Comments in code: "Fix applied at line 42"
3. If browser tools available:
   - Navigates to page
   - Takes before/after screenshots
   - Reports: "Fix applied and verified"
4. If browser tools unavailable:
   - Reports: "Fix applied, manual verification recommended"

## Verification Workflow Example

### Scenario: Missing Alt Text

**Without browser verification:**
```
web-issue-fixer: Added alt="Company logo" at src/Header.tsx:12
User: *manually opens browser to check*
```

**With browser verification:**
```
web-issue-fixer: 
  Fix #1: Added alt="Company logo"
  File: src/Header.tsx:12
  Screenshot: [shows image with accessible name in browser]
  Verification: PASS - Screen reader will announce "Company logo"
  Evidence: http://localhost:3000/#header-logo
```

### Scenario: Focus Management Fix

**Without browser verification:**
```
web-issue-fixer: Added focus management to modal at src/Modal.tsx:45
User: *manually tests keyboard focus with Tab key*
```

**With browser verification:**
```
web-issue-fixer:
  Fix #3: Added focus trap to modal
  File: src/Modal.tsx:45
  Action: Opened modal, pressed Tab 5 times
  Screenshot: [shows focus cycling within modal]
  Verification: PASS - Focus stays within modal boundary
  Focus order: Close button → Input → Submit → Cancel → Close button
```

## Failure Handling

### Dev Server Not Running

```
web-accessibility-wizard: 
  I need a running dev server to verify fixes.
  Checked ports: 3000, 5173, 8080, 4200, 8000 - none responding.
  
  Would you like me to start your dev server?
  Options:
  - Run npm run dev
  - Run npm start
  - Specify custom command
  - Skip browser verification (I'll still apply fixes)
```

### Page Load Error

```
web-issue-fixer:
  Navigation failed: http://localhost:3000/dashboard
  Error: ERR_CONNECTION_REFUSED
  
  Possible causes:
  - Dev server not started
  - Incorrect port (expected 3000)
  - Network/firewall issue
  
  Fix: Applied to code ✓
  Verification: Skipped (manual verification recommended)
```

### Element Not Found

```
web-issue-fixer:
  Screenshot target not found: .submit-button
  Taking full-page screenshot instead.
  
  Fix: Added aria-label="Submit form" ✓
  Screenshot: [full page view]
  Verification: Code updated, but element not visible in current view.
  Manual verification recommended.
```

### Browser Tools Disabled

```
web-accessibility-wizard (Phase 0):
  Browser tools are not enabled. To use autonomous verification:
  
  Add to settings.json:
  {
    "workbench.browser.enableChatTools": true
  }
  
  Would you like me to:
  - Continue without browser verification (suggestion mode)
  - Wait while you enable the setting (I'll detect when ready)
  - Skip this audit and guide you through setup first
```

## Best Practices

### When to Use Browser Verification

✅ **Use browser verification for:**
- Visual fixes (alt text, color contrast, focus indicators)
- Interactive fixes (keyboard navigation, focus management, ARIA states)
- Dynamic content (live regions, loading states, form validation)
- Layout/structure (heading order, landmark regions, skip links)

❌ **Skip browser verification for:**
- Build-time issues (missing lang on html)
- Static content without visual changes
- Server-side rendered content with no client interactivity
- API/backend accessibility issues

### Performance Considerations

Browser verification adds time to the fix process:
- **Page load:** ~1-3 seconds
- **Screenshot capture:** ~0.5-1 second per element
- **Interactive testing:** ~2-5 seconds per interaction

**Optimization:**
- Batch fixes: Apply multiple fixes, then verify all at once
- Selective verification: Verify only high-priority or visual fixes
- Skip on re-runs: After initial verification, trust subsequent runs

### Screenshot Evidence

Screenshots serve as:
- **Proof of fix** — Visual confirmation that change worked
- **Audit trail** — Documentation for compliance reporting
- **Debugging aid** — Shows what agent saw vs. expected state
- **Training data** — Future improvement of verification logic

Store screenshots in workspace:
- Location: `.a11y-screenshots/`
- Naming: `{timestamp}-{fix-number}-{element-selector}.png`
- Include in audit reports as image embeds

Example screenshot path: `.a11y-screenshots/2026-03-01-fix3-submit-button.png`

## Troubleshooting

### "Browser tools not detected"

**Cause:** Setting not enabled or VS Code version < 1.110

**Fix:**
```json
// .vscode/settings.json
{
  "workbench.browser.enableChatTools": true
}
```

Then restart VS Code or reload window (Ctrl+Shift+P → "Reload Window")

### "Cannot connect to localhost"

**Cause:** Dev server not running or wrong port

**Fix:**
1. Start dev server: `npm run dev` or `npm start`
2. Check console output for actual port (e.g., "Local: http://localhost:5173")
3. Tell agent the correct port if non-standard

### "Screenshot shows blank page"

**Cause:** Page loaded before React/Vue hydrated

**Fix:** Agent should wait for `DOMContentLoaded` or framework-specific ready signal before screenshot

**Agent behavior:**
```javascript
// Internal agent logic (not user-facing)
await page.waitForSelector('body.loaded', { timeout: 5000 })
await page.screenshot({ selector: targetElement })
```

### "Fix applied but verification says FAIL"

**Possible causes:**
1. **CSS hiding element** — Element exists but visibility:hidden or display:none
2. **JavaScript override** — JS removes/modifies the fix after page load
3. **Framework re-render** — Fix not persisted through hot reload
4. **Timing issue** — Agent checked before framework updated DOM

**Agent should:**
1. Report the discrepancy clearly
2. Include both the code snapshot and browser snapshot
3. Suggest manual verification
4. Offer to re-run after user confirms change saved

## Integration with Audit Reports

Browser verification results are included in audit reports:

```markdown
## Issue #12: Missing Alt Text

**File:** src/components/Hero.tsx:45
**Element:** `<img src="/logo.png" />`
**WCAG:** 1.1.1 Non-text Content (Level A)

**Fix Applied:**
```tsx
<img src="/logo.png" alt="Company logo" />
```

**Verification:** ✅ PASS
- Screenshot: [./a11y-screenshots/2026-03-04-12-45-logo.png](./a11y-screenshots/2026-03-04-12-45-logo.png)
- Tested in: Chrome 122 (integrated browser)
- Screen reader impact: Will now announce "Company logo" instead of "logo.png"
- Date verified: 2026-03-04 12:45 UTC
```

## Future Enhancements

Planned improvements to browser-assisted verification:

- **Screen reader testing** — Invoke NVDA/JAWS/VoiceOver via automation APIs
- **Keyboard testing** — Simulate Tab/Enter/Escape sequences automatically
- **Contrast verification** — Measure actual rendered colors vs. stated values
- **Focus indicator detection** — Verify focus outlines are visible (WCAG 2.4.13)
- **Animation detection** — Check for motion compliance (prefers-reduced-motion)
- **Touch target measurement** — Verify 24x24px minimum (WCAG 2.5.8)

## See Also

- [Web Accessibility Wizard](../agents/web-accessibility-wizard.md) — Full audit workflow
- [Web Issue Fixer](../agents/web-issue-fixer.md) — Fix application with verification
- [Context Management](./context-management.md) — Managing long audit conversations
- [WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/) — Official WCAG guidance
