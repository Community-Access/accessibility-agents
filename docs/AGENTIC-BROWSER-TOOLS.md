# Agentic Browser Tools: Design & Implementation Guide

**Version:** 3.0.0 | **Status:** Phase 5.1 Complete | **Last Updated:** March 5, 2026

## 1. Executive Summary

Agentic browser tools enable accessibility agents (web-accessibility-wizard, web-issue-fixer, etc.) to autonomously verify fixes and remediation outcomes in the VS Code integrated browser. Instead of agents applying fixes and hoping they work, agents now:

1. **Apply a fix** to source code
2. **Take a screenshot** in the integrated browser
3. **Analyze the visual result** against accessibility criteria
4. **Report back** with visual evidence: "Fix verified ✓" or "Requires manual review"

This closes the feedback loop for automated accessibility remediation.

---

## 2. Browser Tool Capabilities

### Available Tools (VS Code 1.110+)

```typescript
// Available in agents via integrated browser context
interface BrowserTools {
  browser.click(selector: string): Promise<void>
  browser.type(text: string): Promise<void>
  browser.screenshot(): Promise<Buffer>  // Returns PNG image
  browser.navigate(url: string): Promise<void>
  browser.waitForSelector(selector: string, timeout?: number): Promise<HTMLElement>
  browser.evaluateInBrowser(script: string): Promise<any>
  browser.inspect(selector: string): Promise<DOMDetails>  // Returns element tree
}
```

### Trigger: `workbench.browser.enableChatTools`

Browser tools are **opt-in**. Users must enable:

```json
{
  "workbench.browser.enableChatTools": true
}
```

When disabled, agents gracefully degrade to:
- "I've applied the fix. Please reload the page to verify visually."

When enabled, agents automatically invoke browser tools to gather visual evidence.

---

## 3. Usage Patterns: When & Why

### Pattern 1: Fix Verification (Most Common)

**When:** After applying an accessibility fix  
**Why:** Confirm the fix actually resolves the issue  
**How:**

```
Agent → Apply fix (add alt text) 
      → Take screenshot 
      → Run axe-core scan on rendered page 
      → Report: "Fix verified, contrast ratio is 4.7:1 ✓"
```

**Example workflow:**

```markdown
## Fixing Missing Alt Text

**Apply Fix:**
Applied alt="Diagram showing A11y testing workflow" to <img id="workflow-diagram">

**Verify in Browser:**
[screenshot showing alt text in DevTools]

**Result:** ✓ Alt text is correct and meaningful. Ready to ship.
```

### Pattern 2: Visual Verification (Heavy Use)

**When:** Fixes involve colors, contrast, focus indicators  
**Why:** Visual accessibility requires visual verification  
**How:**

```
Agent → Apply CSS fix (change button color from #333 to #000)
      → Take screenshot showing button before/after
      → Compare contrast ratio (old: 3.2:1 → new: 4.8:1)
      → Report: "Contrast improved. Verified in integrated browser."
```

### Pattern 3: Interaction Testing (Keyboard, Screen Readers)

**When:** Interactive components, focus management, ARIA widgets  
**Why:** Must verify keyboard operability and focus indicators  
**How:**

```
Agent → Apply fix (add missing tabindex, focus management)
      → Invoke browser.click() to trigger interaction
      → Take screenshot showing focus ring
      → Report: "Focus ring visible and correct. Keyboard navigation verified."
```

### Pattern 4: Failure Handling & Graceful Degradation

**When:** Browser unavailable, page fails to load, timeout  
**Why:** Agents must handle all failure modes reliably  
**How:**

```javascript
try {
  const image = await browser.screenshot()
  const analysis = await analyzeContrast(image)
  return `✓ Verified: contrast is ${analysis.ratio}:1`
} catch (error) {
  if (error.code === 'BROWSER_NOT_AVAILABLE') {
    return `⚠️ Browser tools not enabled. Install with: workbench.browser.enableChatTools`
  }
  if (error.code === 'NAVIGATION_TIMEOUT') {
    return `⚠️ Page took too long to load. Please verify manually.`
  }
  return `⚠️ Manual verification required. [details: ${error.message}]`
}
```

---

## 4. Implementation Architecture

### Layer 1: Agent Invocation Interface

Agents invoke browser tools via existing chat infrastructure (no new APIs needed):

```javascript
// In web-accessibility-wizard.agent.md

const result = await runBrowserTool({
  action: 'screenshot',
  timeout: 5000
})

// Returns: { success: true, image: Buffer, metadata: {...} }
```

### Layer 2: Browser Tool Adapter

Translates agent requests to VS Code integrated browser commands:

```python
# .github/scripts/browser-adapter.py
class BrowserToolAdapter:
    def screenshot(self):
        """Request screenshot from integrated browser"""
        # Sends message to VS Code browser context
        # Returns PNG Buffer + metadata (URL, timestamp, viewport)
    
    def click(self, selector: str):
        """Click element and wait for DOM update"""
        # Validates selector exists
        # Clicks element
        # Waits for re-render or timeout
        # Returns success/failure

    def evaluate(self, script: str):
        """Run JavaScript in browser context"""
        # Executes script in page context
        # Returns result as JSON
        # Safe: only readonly operations allowed
```

### Layer 3: Evidence Collection & Analysis

After screenshot, analyze for accessibility:

```python
# .github/scripts/accessibility-analyzer.py
class AccessibilityAnalyzer:
    def analyze_contrast(self, image: Buffer) -> dict:
        """Run OCR + color analysis on screenshot"""
        # Extract colors from screenshot
        # Compute WCAG contrast ratios
        # Report: "Button text: #333 on #FFF = 9.3:1 (AAA) ✓"
    
    def detect_focus_ring(self, image: Buffer) -> dict:
        """Check for visible focus indicator"""
        # Compare before/after screenshots
        # Detect outline or glow
        # Report: "Focus ring visible (2px blue outline) ✓"
    
    def run_axe_in_context(self) -> dict:
        """Run axe-core accessibility scan on loaded page"""
        # Injects axe into browser context
        # Scans current page
        # Returns issues
```

---

## 5. Workflow Example: Complete Fix-Verify Loop

### Scenario: Missing Alt Text + Low Contrast

**Step 1: Agent detects issues**
```
web-accessibility-wizard (Phase 7 of 12): Found 2 issues
  1. Image missing alt text: <img id="hero">
  2. Button contrast too low: #666 text on #AA9977 = 2.1:1
```

**Step 2: Agent applies fixes**
```javascript
// Fix 1: Add alt text
const fix1 = {
  file: 'src/hero.html',
  change: 'Before: <img id="hero" src="...">',
  after: '<img id="hero" src="..." alt="Accessibility testing workflow">'
}

// Fix 2: Improve color
const fix2 = {
  file: 'src/styles.css',
  change: 'button { color: #666; background: #AA9977; }',
  after: 'button { color: #000; background: #FFF; }'  // 14:1 contrast
}

agent.applyFixes([fix1, fix2])
```

**Step 3: Agent verifies in browser** (when enabled)

```javascript
await browser.navigate('http://localhost:3000/hero')

// Verify Fix 1
const img = await browser.inspect('#hero')
const altText = img.getAttribute('alt')
console.log(`✓ Alt text present: "${altText}"`)

// Verify Fix 2
const button = await browser.inspect('button')
const computed = await browser.evaluateInBrowser(
  `getComputedStyle(document.querySelector('button')).color`
)
const contrast = computeContrast('#000', '#FFF')
console.log(`✓ Button contrast: ${contrast}:1 (WCAG AAA)`)

// Take final screenshot
const screenshot = await browser.screenshot()
```

**Step 4: Agent reports with evidence**

```markdown
## Accessibility Fix Report

### Issue 1: Missing Alt Text ✓ FIXED
- **Applied:** Added meaningful alt text to hero image
- **Verified:** Alt text is present and descriptive
- **Status:** Ready to ship

### Issue 2: Low Contrast ✓ FIXED
- **Applied:** Changed button text color from #666 to #000
- **Verified in Browser:**
  - Contrast ratio: 14:1 (WCAG AAA)
  - Page rendered correctly
  - No layout shifts

[Screenshot showing fixed button with proper contrast]

## Recommendation
Both issues are fixed and verified. Ready to merge.
```

---

## 6. Failure Modes & Handling

### Failure Mode 1: Browser Not Available

**Trigger:** `workbench.browser.enableChatTools` is false or no browser context exists

**Response:**
```
⚠️ Browser tools are not enabled. To enable visual verification:
1. Open VS Code settings
2. Search for "Browser Chat Tools"
3. Enable: workbench.browser.enableChatTools
4. Reload window

Without browser tools, fixes are applied but not visually verified.
```

**Agent behavior:** Apply fixes only, skip verification

### Failure Mode 2: Page Navigation Timeout

**Trigger:** Page takes >10 seconds to load or doesn't load at all

**Response:**
```
⚠️ The page didn't load within 10 seconds. Possible causes:
- Page is at http://localhost (check if dev server is running)
- Network connection issue
- Page infinite loops or has very slow initial load

Please verify fixes manually or start the dev server and try again.
```

**Agent behavior:** Stop verification, ask user to reload and retry

### Failure Mode 3: Selector Not Found

**Trigger:** Element specified in fix doesn't exist on current page

**Response:**
```
⚠️ The element to verify (#hero-image) wasn't found on the current page.
Possible causes:
- Page hasn't fully rendered yet
- Selector changed or element was moved
- You're on the wrong page

Current URL: http://localhost:3000/about
Expected page for #hero-image: http://localhost:3000/

Please navigate to the correct page or verify the selector exists.
```

**Agent behavior:** Skip verification for missing element, continue with others

### Failure Mode 4: Screenshot Analysis Fails

**Trigger:** Analyzed cannot extract colors, detect focus rings, etc.

**Response:**
```
⚠️ Visual analysis couldn't verify the complete fix. This can happen if:
- Screenshot is too blurry or low contrast
- Element is partially off-screen
- Browser zoom level is non-standard (set to 100%)

Workaround: Open DevTools and manually inspect the element:
- Right-click element → Inspect
- Look for: [alt text], [color], [outline], [aria-label]
```

**Agent behavior:** Show screenshot to user, ask for manual confirmation

---

## 7. Implementation Phases

### Phase 5.1: Design & Documentation (4 hours) ✅ COMPLETE
- [x] Define browser tool capabilities (screenshot, click, inspect, evaluate)
- [x] Document usage patterns (fix verification, visual verification, interaction testing)
- [x] Design workflow example (alt text + contrast fix)
- [x] Plan failure handling (4 failure modes, graceful degradation)
- [x] Create protocol documentation (this file)

### Phase 5.2: Web Accessibility Wizard Enhancement (3 hours)
- [ ] Add Phase 12 (Browser Verification) to wizard workflow
- [ ] Update agent prompt to invoke browser tools when appropriate
- [ ] Collect screenshots and embed in final report
- [ ] Add "Verified in browser" badge to successful fixes

### Phase 5.3: Web Issue Fixer Enhancement (3 hours)
- [ ] After applying each fix, call `runBrowserTool({ action: 'screenshot' })`
- [ ] Analyze screenshot for visual accessibility metrics
- [ ] Comment on fix with evidence: "✓ Verified" or "⚠️ Manual review needed"
- [ ] Generate before/after comparison image (if fix is CSS/color related)

### Phase 5.4: Testing & Iteration (3 hours)
- [ ] Manual testing on real project (load page, apply fix, verify in browser)
- [ ] Test all 4 failure modes
- [ ] Test graceful degradation when `workbench.browser.enableChatTools` is false
- [ ] Iterate UX based on testing results
- [ ] Update documentation with real examples

**Total Phase 5:** 13 hours

---

## 8. Success Criteria

### Phase 5 Is Complete When:

**Technical:**
- ✓ Agents can invoke `browser.screenshot()` and receive PNG
- ✓ Agents can invoke `browser.click()`, `browser.type()`, `browser.navigate()`
- ✓ Agents can invoke `browser.evaluateInBrowser()` for custom checks
- ✓ Agents implement all 4 failure modes with graceful degradation
- ✓ Agents embed visual evidence (screenshots) in fix reports
- ✓ Screenshots include metadata (URL, timestamp, viewport size)

**User Experience:**
- ✓ Users see "Verified in browser ✓" when fixes are confirmed
- ✓ Users see "Manual verification recommended ⚠️" when analysis fails
- ✓ Users can enable/disable browser tools easily
- ✓ Users can retry verification if page didn't load
- ✓ Before/after images shown for visual fixes (contrast, colors)

**Documentation:**
- [ ] Added "Browser-Assisted Verification" section to web-accessibility-wizard.agent.md
- [ ] Updated README with "Using Browser Verification" guide
- [ ] Created troubleshooting section for failure modes
- [ ] Added examples to docs/AGENTIC-BROWSER-TOOLS.md (this file)

---

## 9. Integration Points

### With web-accessibility-wizard

```markdown
# Phase 12: Browser Verification

Would you like me to verify fixes in the integrated browser?

[Button: "Yes, verify in browser"]  
[Button: "Skip, I'll verify manually"]

If yes:
- Apply all Phase 1-11 fixes
- Take screenshot for each fix
- Run accessibility analysis on rendered page
- Report results with visual evidence
```

### With web-issue-fixer

```javascript
// After applying a fix:
const result = {
  filename: 'src/index.html',
  change: 'Added alt="..." to image',
  
  // NEW: Browser verification
  verified: true,
  evidence: {
    screenshot: Buffer,
    analysis: {
      altTextPresent: true,
      altQuality: 'meaningful',
      contrastRatio: 14.5,
      focusIndicatorVisible: true
    },
    timestamp: '2026-03-05T14:22:00Z',
    url: 'http://localhost:3000/'
  }
}
```

### With existing agents (aria-specialist, contrast-master, etc.)

Browser tools are **transparent** to existing agents. They:
- Don't change existing agent APIs
- Enhance agents by providing visual feedback
- Are optional (gracefully degrade if disabled)
- Can be used independently or in combination

---

## 10. Security Considerations

### What Scripts Can Access

```javascript
// ALLOWED (readonly):
document.querySelector()         // Find elements
element.getAttribute()            // Read attributes
getComputedStyle()               // Read computed CSS
window.location.href             // Read current URL

// BLOCKED (security):
document.write()                 // Write to page
eval()                           // Execute arbitrary code
fetch()                          // Network requests
localStorage.setItem()           // Modify storage
window.location.href = '...'     // Navigate (only via browser.navigate())
```

### Validation

- All selector strings are validated against CSS selector spec
- All scripts are static (no string concatenation for eval)
- All network requests go through VS Code's browser context (authenticated)
- Screenshots are stored locally, never sent to servers

---

## 11. Configuration

### Enable Browser Tools

**Settings (User Scope):**
```json
{
  "workbench.browser.enableChatTools": true
}
```

**Settings (Workspace Scope):**
```json
// .vscode/settings.json
{
  "workbench.browser.enableChatTools": true,
  "[agent]": {
    "workbench.browser.enableChatTools": true
  }
}
```

### Configure Timeouts

```json
{
  "workbench.browser.toolTimeout": 10000,      // 10 seconds
  "workbench.browser.navigationTimeout": 30000 // 30 seconds
}
```

---

## 12. Metrics & Telemetry

### What We Track

- **Screenshot count:** How many screenshots per session?
- **Verification success rate:** How often does verification succeed vs fail?
- **Failure modes:** Which failure mode happens most often?
- **Time to verify:** How long does verification take on average?
- **User acceptance:** Do users enable browser tools?

### Privacy

- No screenshots are uploaded to external servers
- No page content is analyzed outside the browser
- All analysis is local to VS Code instance
- Users can disable telemetry via VS Code settings

---

## 13. References

- **VS Code 1.110 Release Notes** — https://code.visualstudio.com/updates/
- **VS Code Browser Tools API** — https://code.visualstudio.com/docs/copilot/customization/overview
- **Integrated Browser Documentation** — https://code.visualstudio.com/docs/editor/debugging
- **WCAG 2.2: Visual Accessibility** — https://www.w3.org/TR/WCAG22/

---

## 14. Next Steps

→ [Phase 5.2: Enhance web-accessibility-wizard](./AGENTIC-BROWSER-TOOLS.md#implementation-phases)  
→ [Phase 5.3: Enhance web-issue-fixer](./AGENTIC-BROWSER-TOOLS.md#implementation-phases)  
→ [Phase 5.4: Testing & Iteration](./AGENTIC-BROWSER-TOOLS.md#implementation-phases)
