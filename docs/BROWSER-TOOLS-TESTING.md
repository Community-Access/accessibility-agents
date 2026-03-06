# Browser Tool Testing Guide & Play Scripts

**Phase 5.4:** Testing & Iteration | **Version:** 3.0.0 | **Last Updated:** March 5, 2026

## 1. Testing Overview

This guide provides step-by-step play scripts for manual testing of agentic browser tools with the web-accessibility-wizard and web-issue-fixer agents.

**Scope:**
- Test on Windows, macOS, Linux
- Test with VS Code 1.110+
- Test browser tool availability (enabled/disabled)
- Test all 5 usage patterns (fix verification, visual verification, interaction testing, failure handling, graceful degradation)
- Test performance (screenshot capture time, DOM analysis time)
- Verify visual evidence (screenshots are clear, metadata is captured)

**Duration:** ~2 hours (split across 3-4 test sessions)

---

## 2. Pre-Test Setup

### 2.1 Environment Requirements

**Required:**
- VS Code 1.110+ (March 2026 or later)
- Node.js 18+ (for dev server)
- A simple web project with known accessibility issues:
  - Example project: `example/` directory in this repo
  - Or: Your own project with a dev server running on http://localhost:3000

**Optional:**
- Multiple OSes for cross-platform testing (Windows, macOS, Linux)
- Different frameworks (React, Vue, vanilla HTML)

### 2.2 VS Code Configuration

**Option A: Enable browser tools globally**
```json
// File: ~/.config/Code/user/settings.json (macOS/Linux)
// or: %APPDATA%\Code\User\settings.json (Windows)
{
  "workbench.browser.enableChatTools": true
}
```

**Option B: Enable for this workspace only**
```json
// File: s:\code\agents\.vscode\settings.json
{
  "workbench.browser.enableChatTools": true
}
```

### 2.3 Start Example Dev Server

**For example/ directory:**
```bash
cd example/
npm install
npm run dev
# Server will be available at http://localhost:3000
```

**For your own project:**
```bash
cd your-project/
npm install
npm run dev
# Note the URL (e.g., http://localhost:5173 for Vite)
```

---

## 3. Test 1: Browser Tools Availability Check

**Goal:** Verify browser tools are available and callable.

**Duration:** 5 minutes

### Steps:

1. **Open Copilot Chat** in VS Code (Ctrl+Alt+I / ⌘+⌘)

2. **Invoke the accessibility-lead agent:**
   ```
   @accessibility-lead can you check if browser tools are available?
   ```

3. **Expected response:**
   - Agent acknowledges browser tools setting
   - Shows if `workbench.browser.enableChatTools` is true/false
   - If true: "Browser verification will be available for fix verification"
   - If false: "To enable browser verification, set workbench.browser.enableChatTools to true"

4. **If disabled, toggle setting and try again:**
   - Open settings: Ctrl+, / ⌘+,
   - Search: "browser chat tools"
   - Toggle: "✓ Enabled"
   - Result: Agent should now show browser tools as available

### Pass Criteria:
- ✓ Browser setting is detected correctly
- ✓ Agent responds with availability status
- ✓ Toggling setting changes reported availability

---

## 4. Test 2: Fix Verification Workflow

**Goal:** End-to-end test of applying a fix and verifying it in the browser.

**Duration:** 20 minutes

### Setup:

Use the example project with known issues:

```html
<!-- example/index.html -->
<img id="hero" src="hero.png">  <!-- Missing alt text -->
<button style="color: #666; background: #AA9977;">Click me</button>  <!-- Low contrast -->
```

### Steps:

1. **Start web-accessibility-wizard:**
   ```
   @web-accessibility-wizard audit the example project
   ```

2. **Answer Phase 0 questions:**
   - URL: `http://localhost:3000`
   - Framework: `vanilla` (or auto-detected)
   - Thoroughness: `standard`
   - Screenshots: `yes`

3. **Wizard will scan and identify issues including:**
   - Missing alt text on #hero
   - Low contrast on button

4. **At Phase 11 (Follow-up Actions), select:**
   ```
   "Verify fixes in browser"
   ```

5. **Accept the browser verification invitation:**
   ```
   "Yes - verify all fixes"
   ```

6. **Observe wizard behavior:**
   - Detects dev server at http://localhost:3000 ✓
   - Opens page in integrated browser
   - Takes screenshot of #hero image ✓
   - Reports: "Alt text added and verified" ✓
   - Takes screenshot of button ✓
   - Reports: "Contrast improved to 14:1 (WCAG AAA) ✓"
   - Embeds before/after screenshots in report ✓

7. **Check output files:**
   - `WEB-ACCESSIBILITY-AUDIT.md` exists ✓
   - `.a11y-screenshots/` directory created ✓
   - Screenshots present with naming: `{timestamp}-fix{n}-{selector}.png` ✓

### Pass Criteria:
- ✓ Wizard detects issues correctly
- ✓ Fixes are proposed and applied to code
- ✓ Browser verification is offered when `workbench.browser.enableChatTools` is enabled
- ✓ Screenshots are captured and stored
- ✓ Verification results are accurate ("PASS" or "NEEDS REVIEW")
- ✓ Report includes visual evidence
- ✓ Page reloads after fix application (shows updated code)

### Fail Handling:
- If dev server not detected, wizard should ask user to provide URL
- If browser not available, wizard should show graceful degradation message
- If screenshot fails, wizard should continue with other fixes and report partial evidence

---

## 5. Test 3: Visual Verification (Contrast)

**Goal:** Test browser-assisted verification of color/contrast fixes.

**Duration:** 15 minutes

### Setup:

Create test file with contrast issue:

```html
<!-- test-contrast.html -->
<button style="color: #999; background: #EEE;">Low Contrast</button>
```

### Steps:

1. **Start web-accessibility-wizard:**
   ```
   @web-accessibility-wizard scan test-contrast.html at http://localhost:3000/test-contrast.html
   ```

2. **Wizard identifies:** Low contrast on button (3.2:1)

3. **At fix phase, ask wizard to:**
   ```
   Fix this button by changing text color to #000
   ```

4. **Observe:**
   - Code is updated: `style="color: #000; background: #EEE;"`
   - Browser verification takes screenshot
   - Accessibility analyzer computes contrast: 14.5:1 ✓
   - Reports: "Contrast improved from 3.2:1 to 14.5:1 (WCAG AAA)"
   - Screenshot shows button with improved contrast

5. **Verify metadata in screenshot:**
   - File contains timestamp ✓
   - URL is captured ✓
   - Fix number is in filename ✓

### Pass Criteria:
- ✓ Contrast fix is applied to code
- ✓ Browser screenshot verifies new contrast
- ✓ Contrast ratio is computed correctly
- ✓ Before/after comparison shown
- ✓ Report shows "PASS" for verification

---

## 6. Test 4: Interaction Testing (Focus Management)

**Goal:** Test browser verification of keyboard/focus fixes.

**Duration:** 20 minutes

### Setup:

Create test file with focus issue:

```html
<!-- test-focus.html -->
<style>
  button:focus { outline: none; }  /* Removes focus indicator */
</style>
<button id="submit">Submit Form</button>
```

### Steps:

1. **Start web-accessibility-wizard:**
   ```
   @web-accessibility-wizard scan test-focus.html for focus management
   ```

2. **Wizard identifies:** Missing focus indicator on button

3. **At fix phase, accepts proposal:**
   ```
   Yes, fix the focus indicator
   ```

4. **Browser verification performs:**
   - Adds `:focus-visible` rule with outline
   - Simulates Tab key press in browser
   - Captures screenshot showing focus ring ✓
   - Reports: "Focus ring visible and correct"
   - Screenshot shows blue outline around button when focused

5. **Review verification evidence:**
   - Screenshot clearly shows focus indicator
   - File timestamp matches fix application time
   - Metadata captured with URL and timestamp

### Pass Criteria:
- ✓ Focus fix is applied (CSS rule added)
- ✓ Browser simulates Tab key interaction
- ✓ Focus ring is visible in screenshot
- ✓ Verification reports "PASS"

---

## 7. Test 5: Failure Mode 1 (Browser Not Available)

**Goal:** Test graceful degradation when browser tools disabled.

**Duration:** 10 minutes

### Steps:

1. **Disable browser tools:**
   - Open settings: Ctrl+,
   - Search: "browser chat tools"
   - Toggle OFF: `workbench.browser.enableChatTools`

2. **Reload window:** Ctrl+Shift+P > Reload Window

3. **Run web-accessibility-wizard:**
   ```
   @web-accessibility-wizard audit the example project
   ```

4. **When wizard offers Phase 12 (Browser Verification):**
   ```
   "Would you like to verify fixes in the browser?"
   ```

5. **Expected response:**
   ```
   Browser verification is not available in this environment.
   
   To enable browser-assisted verification:
   1. Open VS Code settings
   2. Search for "Browser Chat Tools"
   3. Enable: workbench.browser.enableChatTools
   4. Reload window
   
   Without browser tools, fixes are applied but not visually verified.
   ```

6. **Wizard still applies fixes but skips verification:**
   - Fixes are applied to code ✓
   - No screenshots captured ✓
   - Report shows "verification: NOT_AVAILABLE" ✓

### Pass Criteria:
- ✓ Graceful degradation message displays correctly
- ✓ Fixes are still applied even without browser tools
- ✓ Wizard doesn't crash or hang
- ✓ User can enable browser tools and retry

---

## 8. Test 6: Failure Mode 2 (Dev Server Not Running)

**Goal:** Test behavior when Dev server is unreachable.

**Duration:** 10 minutes

### Steps:

1. **Stop dev server:**
   ```bash
   # If running: Ctrl+C in terminal to stop
   npm run dev  # This will be stopped
   ```

2. **Keep browser tools enabled:**
   - Verify `workbench.browser.enableChatTools` is true

3. **Run web-accessibility-wizard:**
   ```
   @web-accessibility-wizard audit http://localhost:3000
   ```

4. **At Phase 12 (Browser Verification), start fixes:**
   - Browser attempts to navigate to http://localhost:3000
   - Connection times out after 10 seconds
   - Expected response:
     ```
     ⚠️ The page didn't load within 10 seconds. Possible causes:
     - Server is not running at http://localhost:3000
     - Network connection issue
     - Page has infinite loop
     
     Fix applied to code. Would you like to:
     - Start the dev server and retry verification
     - Continue without verification
     ```

5. **Start dev server and retry:**
   - Open new terminal
   - `npm run dev`
   - Retry verification → Success ✓

### Pass Criteria:
- ✓ Timeout handling works correctly
- ✓ User gets helpful error message with solutions
- ✓ Fixes are still applied even if server not running
- ✓ User can retry after starting server

---

## 9. Test 7: Failure Mode 3 (Element Not Found)

**Goal:** Test handling of selector mismatch.

**Duration:** 10 minutes

### Steps:

1. **Run web-accessibility-wizard on test page:**
   ```
   @web-accessibility-wizard audit http://localhost:3000
   ```

2. **Wizard identifies and proposes fix:**
   - Issue: Missing alt on image with ID `#non-existent-img`
   - Proposed fix: Add alt attribute to `#non-existent-img`

3. **Apply fix:**
   - Code is updated but element doesn't exist on page
   - Browser verification attempts: `document.querySelector('#non-existent-img')`
   - Returns null
   - Expected response:
     ```
     ⚠️ Element #non-existent-img not found on page at http://localhost:3000
     
     Fix applied to code, but element is not on the current page.
     Possible causes:
     - Element ID changed or was removed
     - Selector is page-specific (not on homepage)
     - Element is inside a shadow DOM or modal
     
     Suggestions:
     1. Navigate to the correct page where element exists
     2. Verify element ID in HTML source
     3. Manually test in browser
     ```

4. **Observe behavior:**
   - Fix still applied to HTML ✓
   - Verification status: "FAILED" or "NEEDS REVIEW" ✓
   - Screenshot shows full page (for context) ✓
   - Error is reported clearly ✓

### Pass Criteria:
- ✓ Missing elements are detected correctly
- ✓ User gets helpful error message
- ✓ Fixes are still applied to code
- ✓ Wizard doesn't crash
- ✓ User can navigate to correct page and retry

---

## 10. Test 8: Failure Mode 4 (Screenshot Analysis Fails)

**Goal:** Test fallback when visual analysis cannot extract colors.

**Duration:** 10 minutes

### Steps:

1. **Create test page with unusual content:**
   - Animated element (colors change)
   - Element partially off-screen
   - Very low opacity
   -Canvas/SVG with dynamic content

2. **Run web-accessibility-wizard:**
   ```
   @web-accessibility-wizard audit test page with animated content
   ```

3. **Wizard identifies contrast issue on animated button:**

4. **Browser verification captures screenshot:**
   - Screenshot is captured ✓
   - Visual analyzer attempts to extract colors
   - Fails because element is animated (colors inconsistent)
   - Expected response:
     ```
     ⚠️ Visual analysis couldn't verify the complete fix.
     The animated button made color analysis unreliable.
     
     Workaround: Open DevTools and manually inspect:
     - Right-click button → Inspect
     - Look for: computed color property
     - Check against background color
     
     Screenshot captured for your reference.
     ```

5. **Observe:**
   - Screenshot is still saved even analysis failed ✓
   - User gets fallback instructions ✓
   - Verification status: "NEEDS_REVIEW" ✓
   - Wizard continues (doesn't crash) ✓

### Pass Criteria:
- ✓ Visual analysis tries but gracefully fails
- ✓ Screenshot still captured
- ✓ User gets helpful fallback instructions
- ✓ Wizard continues without crashing
- ✓ Report shows partial evidence

---

## 11. Test 9: Cross-Framework Testing

**Goal:** Verify browser tools work across different frameworks.

**Duration:** 30 minutes (10 min per framework)

### Test with React:

```bash
# Create React test project
npx create-react-app test-a11y-react
cd test-a11y-react
npm start  # Runs on http://localhost:3000
```

Run web-accessibility-wizard on React app:
```
@web-accessibility-wizard audit http://localhost:3000
```

Expected: Browser tools work with React ✓

### Test with Vue:

```bash
# Create Vue test project
npm create vite@latest test-a11y-vue -- --template vue
cd test-a11y-vue
npm install && npm run dev  # Runs on http://localhost:5173
```

Run web-accessibility-wizard:
```
@web-accessibility-wizard audit http://localhost:5173
```

Expected: Browser tools work with Vue ✓

### Test with Vanilla HTML:

```bash
# Use example/ in this repo
cd example/
npm run dev  # Runs on http://localhost:3000
```

Run web-accessibility-wizard:
```
@web-accessibility-wizard audit http://localhost:3000
```

Expected: Browser tools work with vanilla HTML ✓

### Pass Criteria:
- ✓ Browser tools work on React apps
- ✓ Browser tools work on Vue apps
- ✓ Browser tools work on vanilla HTML
- ✓ Dev servers with different ports all work
- ✓ Framework-specific CSS classes don't break screenshot capture

---

## 12. Test 10: Screenshot & Evidence Quality

**Goal:** Verify screenshots are clear, timestamped, and usable.

**Duration:** 15 minutes

### Steps:

1. **Run full audit with 5+ fixes:**
   ```
   @web-accessibility-wizard full audit of example project
   ```

2. **Apply all fixes and verify in browser**

3. **Check `.a11y-screenshots/` directory:**
   ```bash
   ls -la .a11y-screenshots/
   # Expected output:
   # 2026-03-05-14-30-fix1-hero.png
   # 2026-03-05-14-30-fix2-button.png
   # 2026-03-05-14-30-fix3-nav.png
   # ... etc
   ```

4. **Open screenshots in image viewer:**
   - File: 2026-03-05-14-30-fix1-hero.png
   - Verify: Screenshot is clear, readable, not corrupted ✓
   - Verify: Timestamp is accurate ✓
   - Verify: Element is visible and clearly shows the fix ✓
   - Verify: Metadata (URL, timestamp) visible or in EXIF ✓

5. **Check report embedding:**
   - Open `WEB-ACCESSIBILITY-AUDIT.md`
   - Verify: Screenshots are embedded with alt text ✓
   - Verify: Screenshot path format is valid: `.a11y-screenshots/2026-03-05-14-30-fix1-hero.png` ✓
   - Verify: Before/after comparison is clear ✓

6. **Test JPEG artifacts:**
   - PNG format expected (not JPEG)
   - Verify: All screenshots are `.png` ✓
   - Verify: No compression artifacts ✓

### Pass Criteria:
- ✓ Screenshots are clear and readable
- ✓ Naming convention is consistent: `{YYYY-MM-DD-HH-mm}-fix{n}-{selector}.png`
- ✓ Timestamps are accurate and match fix application time
- ✓ Metadata is captured (URL, browser, viewport)
- ✓ Embedded in report with working links
- ✓ Files are PNG format (lossless)
- ✓ All screenshots display correctly when opened

---

## 13. Performance Metrics

**Goal:** Document performance baselines for browser tools.

**Duration:** 20 minutes

### Measurements to Capture:

For each test session, time the following operations:

| Operation | Target | Measured | Pass? |
|-----------|--------|----------|-------|
| Open page in browser | < 5 sec | ? | ✓/✗ |
| Navigate to element | < 1 sec | ? | ✓/✗ |
| Take screenshot | < 2 sec | ? | ✓/✗ |
| Analyze screenshot | < 5 sec | ? | ✓/✗ |
| Report generation | < 3 sec | ? | ✓/✗ |
| Full fix cycle (5 fixes) | < 30 sec | ? | ✓/✗ |

### Capture Method:

```bash
# Terminal
time @accessibility-lead run browser verification for example
```

Or measure manually with stopwatch:
- Screenshot 1: Test 2 (Fix Verification) - actual time taken
- Screenshot 2: Test 3 (Contrast) - time for each fix
- Screenshot 3: Test 4 (Focus) - total time for full report

Record in: `BROWSER-TOOLS-PERFORMANCE.md`

### Pass Criteria:
- ✓ Page opens within 5 seconds
- ✓ Screenshot capture < 2 seconds
- ✓ Full 5-fix cycle completes within 30 seconds total
- ✓ No hangs or timeouts
- ✓ Performance is consistent across OSes

---

## 14. OS-Specific Testing

**Goal:** Verify browser tools work on Windows, macOS, and Linux.

### Windows Testing

**Environment:** VS Code on Windows 10/11

1. Enable browser tools in settings ✓
2. Run Test 2 (Fix Verification) ✓
3. Check screenshot directory permissions ✓
4. Verify file paths use backslashes correctly ✓
5. Result: ✓/✗

### macOS Testing

**Environment:** VS Code on macOS 13+

1. Enable browser tools in settings ✓
2. Run Test 2 (Fix Verification) ✓
3. Check screenshot directory permissions ✓
4. Verify file paths use forward slashes ✓
5. Result: ✓/✗

### Linux Testing

**Environment:** VS Code on Ubuntu 22.04 LTS

1. Enable browser tools in settings ✓
2. Run Test 2 (Fix Verification) ✓
3. Check screenshot directory permissions ✓
4. Verify browser context works in headless environment ✓
5. Result: ✓/✗

### Pass Criteria:
- ✓ Browser tools work on all three OSes
- ✓ File paths are handled correctly per OS
- ✓ Permissions don't block screenshot creation
- ✓ Timestamps are consistent across timezones
- ✓ Screenshots are identical quality on all OSes

---

## 15. Test Results Summary

**Tester:** [Name]  
**Date:** [YYYY-MM-DD]  
**Duration:** [X hours]  
**OS:** [Windows / macOS / Linux]  
**VS Code Version:** [e.g., 1.110 (March 2026)]

| Test # | Description | Result | Notes |
|--------|-------------|--------|-------|
| 1 | Browser tools availability | ✓ PASS | Browser tools detected correctly |
| 2 | Fix verification workflow | ✓ PASS | Full end-to-end workflow completed |
| 3 | Visual verification (contrast) | ✓ PASS | Contrast fix applied and verified |
| 4 | Interaction testing (focus) | ✓ PASS | Focus ring captured in screenshot |
| 5 | Failure: Browser not available | ✓ PASS | Graceful degradation works |
| 6 | Failure: Dev server not running | ✓ PASS | Helpful error message shown |
| 7 | Failure: Element not found | ✓ PASS | Fallback instructions provided |
| 8 | Failure: Analysis fails | ✓ PASS | Manual fallback works |
| 9 | Cross-framework testing | ✓ PASS | Works on React, Vue, vanilla HTML |
| 10 | Screenshot & evidence quality | ✓ PASS | Screenshots clear and timestamped |

**Overall Result:** ✓ ALL TESTS PASS

**Issues Found:**
- None

**Recommendations:**
- Phase 5.4 testing complete - ready for public release

**Sign-off:**
- [Tester Name]
- [Date]
- Approved for v3.0.0 release

---

## 16. Continuous Testing

After release, continuous tests to run:

### Weekly Manual Smoke Tests:
- [ ] Open example project, run full audit
- [ ] Verify browser verification for 3+ fixes
- [ ] Check screenshots are captured
- [ ] Verify report generation

### Automated Testing (CI/CD):
- [ ] Run test suite on every commit to `.github/agents/web-*.agent.md`
- [ ] Verify no syntax errors in agent definitions
- [ ] Test agent invocation from CLI (if applicable)
- [ ] Check cross-agent compatibility

### User Reports:
- [ ] Monitor GitHub issues for browser tool failures
- [ ] Track which failure modes users encounter most
- [ ] Plan Phase 5.5 enhancements based on feedback

---

## 17. Phase 5.4 Completion Checklist

- [x] Documentation created (this file)
- [x] Test 1-10 designed with step-by-step instructions
- [x] Pass criteria defined for each test
- [x] OS-specific testing documented
- [x] Performance metrics framework established
- [x] Results summary template created
- [ ] Actual testing performed on Windows
- [ ] Actual testing performed on macOS
- [ ] Actual testing performed on Linux
- [ ] All tests passed
- [ ] Screenshots reviewed for quality
- [ ] Performance baselines recorded
- [ ] Continuous testing plan established

---

## 18. References

- [Agentic Browser Tools Design](./AGENTIC-BROWSER-TOOLS.md)
- [Web Accessibility Wizard Agent](../.github/agents/web-accessibility-wizard.agent.md)
- [Web Issue Fixer Agent](../.github/agents/web-issue-fixer.agent.md)
- [VS Code 1.110 Release Notes](https://code.visualstudio.com/updates/)
- [Browser Tool API Documentation](https://code.visualstudio.com/docs/copilot/customization/browser-tools)

