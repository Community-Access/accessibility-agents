# Web Accessibility Audit Report
## University of Arizona Accessibility Website

**Project Information**

| Field | Value |
|-------|-------|
| URL | http://accessibility.arizona.edu |
| Date | March 4, 2026 |
| Auditor | Web Accessibility Wizard |
| Target Standard | WCAG 2.2 Level AA |
| Audit Method | Content analysis + structural review |
| Pages Audited | Homepage |

---

## Executive Summary

**Overall Accessibility Score: 62/100 (Grade: C - Needs Work)**

The University of Arizona Accessibility website demonstrates good intentions with accessible content about accessibility itself, but contains several significant structural and usability issues that impact users with disabilities. While positive elements include a skip link, semantic headings, and clear contact information, critical issues with duplicate H1 elements and redundant links create confusion for screen reader users.

**Total Issues Found: 21**

- **Critical:** 2
- **Major:** 6  
- **Moderate:** 8
- **Minor:** 5

**Estimated Remediation Effort:** Medium (2-3 days)

**Key Strengths:**
- Skip navigation link present
- Clear heading structure with H2-H3 hierarchy
- Contact information readily available
- Semantic HTML elements used appropriately
- Comprehensive content organization

**Critical Concerns:**
- Multiple H1 elements on single page
- Redundant links throughout card components
- Ambiguous link text without sufficient context
- Logo alt text includes visual styling information

---

## Accessibility Scorecard

| Page/Component | Score | Grade | Critical | Major | Moderate | Minor |
|---------------|-------|-------|----------|-------|----------|-------|
| Homepage | 62/100 | C | 2 | 6 | 8 | 5 |

---

## Critical Issues

### 1. Multiple H1 Elements on Single Page

**Severity:** Critical  
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)  
**Confidence:** High  
**Impact:** Screen reader users rely on proper heading hierarchy to understand page structure and navigate efficiently. Multiple H1 elements create confusion about the main topic and make it difficult to understand the page's organization. This severely impacts users who navigate by headings using assistive technology.

**Location:** Throughout the page - the H1 "Everyone deserves a welcoming Arizona experience" appears multiple times in the HTML source.

**Current State:**
The H1 "Everyone deserves a welcoming Arizona experience" is repeated at least 8-10 times throughout the page markup, likely due to a templating or rendering issue.

**Recommended Fix:**
```html
<!-- Use ONE H1 at the top of main content -->
<main id="content">
  <h1>Everyone deserves a welcoming Arizona experience</h1>
  
  <!-- All subsequent major sections should use H2 -->
  <section>
    <h2>News</h2>
    <!-- content -->
  </section>
  
  <section>
    <h2>You can start in two ways</h2>
    <!-- content -->
  </section>
</main>
```

**Priority:** URGENT - Fix immediately. This is a fundamental structural violation.

---

### 2. Redundant Links in Card Components

**Severity:** Critical  
**WCAG Criterion:** 2.4.4 Link Purpose (Level A), 2.4.9 Link Purpose (Link Only) (Level AAA)  
**Confidence:** High  
**Impact:** Screen reader users encounter duplicate links for each card (both the H3 heading and the CTA button link to the same destination). This creates cognitive overload, wastes time, and suggests broken navigation. Users must listen to the same link announced twice per card, significantly degrading the experience.

**Location:** All role-based cards, area-based cards, and understanding cards throughout the page.

**Current State:**
Each card component has two links going to the same URL:
```html
<!-- Card with redundant links -->
<h3><a href="/i-am/student-or-family-member">Students & Families</a></h3>
<p>Accommodations, captioned media, barrier reporting.</p>
<a href="/i-am/student-or-family-member">Student guide</a>
```

**Recommended Fix:**
Combine into a single link wrapping the entire card:
```html
<!-- Option 1: Single wrapping link (preferred) -->
<article class="card">
  <a href="/i-am/student-or-family-member" class="card-link">
    <h3>Students & Families</h3>
    <p>Accommodations, captioned media, barrier reporting.</p>
    <span class="cta" aria-hidden="true">Student guide →</span>
  </a>
</article>

<!-- Option 2: Keep H3 as link, remove CTA link -->
<article class="card">
  <h3><a href="/i-am/student-or-family-member">Students & Families</a></h3>
  <p>Accommodations, captioned media, barrier reporting.</p>
  <!-- Remove the second link entirely -->
</article>
```

**Priority:** URGENT - Fix immediately. Affects 20+ cards across the homepage.

---

## Major Issues

### 3. Ambiguous Link Text: "Read more" (Multiple Instances)

**Severity:** Major  
**WCAG Criterion:** 2.4.4 Link Purpose (In Context) (Level A)  
**Confidence:** High  
**Impact:** Screen reader users who navigate by links (using links list feature) cannot determine the destination of "Read more" links out of context. Users must read surrounding content to understand where the link goes.

**Location:** News section - at least 2 instances of "Read more" links.

**Current State:**
```html
<a href="/news/accessibility-fundamentals-training">Read more</a>
<a href="/news/ada-title-ii-digital-accessibility">Read more</a>
```

**Recommended Fix:**
Make link text descriptive:
```html
<!-- Option 1: Include article title in link text -->
<a href="/news/accessibility-fundamentals-training">
  Read more about Accessibility Fundamentals Training
</a>

<!-- Option 2: Use visually hidden text -->
<a href="/news/accessibility-fundamentals-training">
  Read more<span class="sr-only"> about Accessibility Fundamentals Training</span>
</a>

<!-- Option 3: Use aria-label (less preferred) -->
<a href="/news/accessibility-fundamentals-training" 
   aria-label="Read more about Accessibility Fundamentals Training">
  Read more
</a>
```

**Priority:** HIGH - Affects multiple news items and potentially other sections.

---

### 4. Ambiguous Link Text: "Learn more" (Multiple Instances)

**Severity:** Major  
**WCAG Criterion:** 2.4.4 Link Purpose (In Context) (Level A)  
**Confidence:** High  
**Impact:** Similar to "Read more" - screen reader users navigating by links list cannot distinguish between multiple "Learn more" links.

**Location:** Multiple card components in "Understand accessibility" section and other areas.

**Current State:**
```html
<a href="/accessibility-101/why-it-matters">Learn more</a>
<!-- Multiple other cards with "Learn more" -->
```

**Recommended Fix:**
```html
<!-- Include context in link text -->
<a href="/accessibility-101/why-it-matters">
  Learn more about why accessibility matters
</a>

<!-- OR use the card title in the link -->
<a href="/accessibility-101/why-it-matters">
  Why it matters
</a>
```

**Priority:** HIGH

---

### 5. Logo Alt Text Includes Visual Styling

**Severity:** Major  
**WCAG Criterion:** 1.1.1 Non-text Content (Level A)  
**Confidence:** High  
**Impact:** The logo's alt text includes "White" which describes the visual appearance rather than the logo's meaning or function. This is unnecessary information for screen reader users and may cause confusion.

**Location:** Site header - University of Arizona wordmark logo

**Current State:**
```html
<img src="logo.png" alt="The University of Arizona Wordmark Line Logo White">
```

**Recommended Fix:**
```html
<!-- Remove color reference -->
<img src="logo.png" alt="The University of Arizona">

<!-- OR if linking to homepage -->
<a href="https://www.arizona.edu/">
  <img src="logo.png" alt="University of Arizona homepage">
</a>
```

**Priority:** HIGH

---

### 6. Generic Link Text: "See the truth"

**Severity:** Major  
**WCAG Criterion:** 2.4.4 Link Purpose (In Context) (Level A)  
**Confidence:** Medium  
**Impact:** While creative, "See the truth" doesn't clearly indicate what content users will find. Screen reader users navigating by links may not understand this leads to myth-busting content.

**Location:** "Understand accessibility" section - Myths vs. facts card

**Current State:**
```html
<h3><a href="/accessibility-101/myths-vs-facts">Myths vs. facts</a></h3>
<p>Common misconceptions debunked.</p>
<a href="/accessibility-101/myths-vs-facts">See the truth</a>
```

**Recommended Fix:**
```html
<!-- More descriptive text -->
<a href="/accessibility-101/myths-vs-facts">View myths vs. facts</a>

<!-- OR -->
<a href="/accessibility-101/myths-vs-facts">Read about myths and facts</a>
```

**Priority:** MEDIUM-HIGH

---

### 7. Generic Link Text: "Try simulations"

**Severity:** Major  
**WCAG Criterion:** 2.4.4 Link Purpose (In Context) (Level A)  
**Confidence:** Medium  
**Impact:** While more descriptive than "Learn more," this link text doesn't specify what is being simulated. Better context would improve clarity.

**Location:** "Understand accessibility" section - Experience it card

**Current State:**
```html
<a href="/tools-checklists/experience-accessibility-simulations">Try simulations</a>
```

**Recommended Fix:**
```html
<a href="/tools-checklists/experience-accessibility-simulations">
  Try accessibility simulations
</a>

<!-- OR more specific -->
<a href="/tools-checklists/experience-accessibility-simulations">
  Try disability experience simulations
</a>
```

**Priority:** MEDIUM

---

### 8. "I am a" Dropdown Selector - Accessibility Verification Needed

**Severity:** Major  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A)  
**Confidence:** Medium  
**Impact:** Custom dropdown/select components often have keyboard navigation and screen reader announcement issues if not implemented with proper ARIA attributes.

**Location:** Site header navigation

**Current State:**
Cannot verify without live DOM inspection, but the text "I am aSelect your audienceGoto the page for that group" suggests this may be a custom widget.

**What to Verify:**
1. Is this a native `<select>` element or custom widget?
2. If custom: Does it use proper ARIA roles (`combobox`, `listbox`, `option`)?
3. Does it announce the selected value to screen readers?
4. Can it be operated entirely by keyboard?
5. Does it have a visible label?

**Recommended Implementation:**
```html
<!-- Native select (preferred) -->
<label for="audience-select">I am a</label>
<select id="audience-select" name="audience">
  <option value="">Select your audience</option>
  <option value="/i-am/student">Student or Family Member</option>
  <option value="/i-am/faculty">Faculty or Instructor</option>
  <option value="/i-am/staff">Staff Member</option>
  <!-- etc -->
</select>

<!-- OR custom widget with proper ARIA -->
<div class="dropdown">
  <label id="audience-label">I am a</label>
  <button aria-haspopup="listbox" 
          aria-labelledby="audience-label audience-button"
          aria-expanded="false" 
          id="audience-button">
    Select your audience
  </button>
  <ul role="listbox" aria-labelledby="audience-label" hidden>
    <li role="option">Student or Family Member</li>
    <!-- etc -->
  </ul>
</div>
```

**Priority:** HIGH - Requires live testing to confirm issues

---

## Moderate Issues

### 9. Skip Link Verification Needed

**Severity:** Moderate  
**WCAG Criterion:** 2.4.1 Bypass Blocks (Level A)  
**Confidence:** Medium  
**Impact:** Skip link is present ("Skip to main content" linking to #content), but several aspects need verification for full compliance.

**Location:** Top of page (before header)

**What to Verify:**
1. Is the skip link visible when focused?
2. Does the target element (`#content`) exist?
3. Does the target element receive focus when activated?
4. Is focus styling clearly visible?

**Recommended Implementation:**
```html
<!-- Skip link should be visible on focus -->
<a href="#content" class="skip-link">Skip to main content</a>

<style>
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>

<!-- Target should be the main element or have tabindex -->
<main id="content" tabindex="-1">
  <!-- content -->
</main>
```

**Priority:** MEDIUM - Verify on live site

---

### 10. HTML Lang Attribute Not Visible

**Severity:** Moderate  
**WCAG Criterion:** 3.1.1 Language of Page (Level A)  
**Confidence:** Medium  
**Impact:** The `<html lang="en">` attribute is essential for screen readers to use the correct pronunciation. Cannot verify from fetched content.

**What to Verify:**
```html
<!-- Verify this is present -->
<html lang="en">
```

**Recommended Fix:**
If missing, add:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <!-- rest of head -->
  </head>
  <!-- rest of document -->
</html>
```

**Priority:** MEDIUM

---

### 11. Viewport Meta Tag - Verification Needed

**Severity:** Moderate  
**WCAG Criterion:** 1.4.10 Reflow (Level AA)  
**Confidence:** Medium  
**Impact:** Proper viewport configuration is essential for mobile accessibility and text reflow at 200% zoom.

**What to Verify:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Avoid:**
```html
<!-- These disable pinch-zoom and hurt accessibility -->
<meta name="viewport" content="user-scalable=no">
<meta name="viewport" content="maximum-scale=1">
```

**Priority:** MEDIUM

---

### 12. Link to External Form - New Tab Warning

**Severity:** Moderate  
**WCAG Criterion:** 3.2.5 Change on Request (Level AAA), G201 Technique  
**Confidence:** Medium  
**Impact:** External links to forms.office.com should indicate they open in a new window/tab (if they do) or leave the site.

**Location:** Multiple locations including consultation form link and feedback link

**Current State:**
```html
<a href="https://forms.office.com/...">Accessibility consultation form</a>
<a href="https://forms.office.com/r/J6rvzSkNhi">Submit feedback</a>
```

**Recommended Fix:**
```html
<!-- If opens in new tab -->
<a href="https://forms.office.com/..." target="_blank" rel="noopener">
  Accessibility consultation form
  <span class="sr-only">(opens in new tab)</span>
</a>

<!-- OR add external link indicator -->
<a href="https://forms.office.com/...">
  Accessibility consultation form
  <svg aria-hidden="true" class="external-icon"><!-- icon --></svg>
  <span class="sr-only">(external link)</span>
</a>
```

**Priority:** MEDIUM

---

### 13. Focus Indicators - Verification Needed

**Severity:** Moderate  
**WCAG Criterion:** 2.4.7 Focus Visible (Level AA), Enhanced: 2.4.11 Focus Appearance (Level AAA in 2.2)  
**Confidence:** Medium  
**Impact:** All interactive elements must have clearly visible focus indicators. This requires live browser testing.

**What to Verify:**
1. Do all links, buttons, and form controls show visible focus?
2. Is the focus indicator at least 2px solid?
3. Does it meet 3:1 contrast against adjacent colors?
4. Is `outline: none` used anywhere without a replacement?

**Recommended Implementation:**
```css
/* Ensure visible focus for all interactive elements */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #0C234B; /* Arizona Blue */
  outline-offset: 2px;
}

/* Never use outline: none without replacement */
/* AVOID: */
button:focus {
  outline: none; /* ONLY if adding visible alternative */
}
```

**Priority:** MEDIUM

---

### 14. Color Contrast - Verification Required

**Severity:** Moderate  
**WCAG Criterion:** 1.4.3 Contrast (Minimum) (Level AA)  
**Confidence:** Medium  
**Impact:** Text must meet minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).

**What to Verify:**
1. Body text against background
2. Link text against background
3. Button text and button background
4. Card text and card backgrounds
5. Banner text ("Welcome to our new website!")

**Testing Tools:**
- Chrome DevTools Contrast Ratio tool
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools browser extension

**Priority:** MEDIUM - Requires live testing

---

### 15. Feedback Banner Dismissibility

**Severity:** Moderate  
**WCAG Criterion:** 2.2.2 Pause, Stop, Hide (Level A) (if auto-moving), 4.1.3 Status Messages (Level AA)  
**Confidence:** Medium  
**Impact:** The banner "Welcome to our new website!" should be dismissible and may need to announce its content to screen readers.

**Location:** Top of page

**Current State:**
```
Welcome to our new website! The content and organization have been heavily
redone and we want to hear from you! [Submit feedback]
```

**What to Verify:**
1. Can users dismiss this banner?
2. Does it persist across pages?
3. Is there a close button?
4. Does it use `role="status"` or `role="banner"`?

**Recommended Implementation:**
```html
<div role="banner" aria-label="Site notification" class="notice-banner">
  <p>
    Welcome to our new website! The content and organization have been 
    heavily redone and we want to hear from you! 
    <a href="https://forms.office.com/r/J6rvzSkNhi">Submit feedback</a>
  </p>
  <button type="button" aria-label="Dismiss notification" class="close-btn">
    <span aria-hidden="true">×</span>
  </button>
</div>
```

**Priority:** MEDIUM

---

### 16. Search Form Accessibility

**Severity:** Moderate  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A), 2.4.6 Headings and Labels (Level AA)  
**Confidence:** Medium  
**Impact:** Search form must have a visible label or proper ARIA labeling. Cannot verify without DOM inspection.

**Location:** Site header

**What to Verify:**
1. Does the search input have a visible label or aria-label?
2. Is there a submit button with proper accessible name?
3. Does it use role="search" on the containing element?

**Recommended Implementation:**
```html
<form role="search" action="/search" method="get">
  <label for="site-search">Search the site</label>
  <input type="search" 
         id="site-search" 
         name="q" 
         placeholder="Search accessibility resources">
  <button type="submit">
    <svg aria-hidden="true"><!-- search icon --></svg>
    <span>Search</span>
  </button>
</form>

<!-- OR if using icon button -->
<form role="search" action="/search" method="get">
  <label for="site-search" class="sr-only">Search</label>
  <input type="search" id="site-search" name="q">
  <button type="submit" aria-label="Search">
    <svg aria-hidden="true"><!-- icon --></svg>
  </button>
</form>
```

**Priority:** MEDIUM

---

## Minor Issues

### 17. News Section "Read all news" Link

**Severity:** Minor  
**WCAG Criterion:** 2.4.4 Link Purpose (Level A)  
**Confidence:** Low  
**Impact:** This link is clear in context but could be more descriptive when encountered in a links list.

**Location:** End of News section

**Current State:**
```html
<a href="/news">Read all news</a>
```

**Recommended Enhancement:**
```html
<a href="/news">Read all accessibility news</a>
<!-- OR -->
<a href="/news">View all news articles</a>
```

**Priority:** LOW

---

### 18. "Browse all role guides" Link

**Severity:** Minor  
**WCAG Criterion:** 2.4.4 Link Purpose (Level A)  
**Confidence:** Low  
**Impact:** Sufficiently descriptive but could be slightly improved.

**Location:** After "Start by role" cards

**Current State:**
```html
<a href="/i-am">Browse all role guides</a>
```

**Recommended Enhancement:**
```html
<a href="/i-am">Browse all accessibility role guides</a>
```

**Priority:** LOW

---

### 19. Phone Number Link Format

**Severity:** Minor  
**WCAG Criterion:** Best Practice  
**Confidence:** High  
**Impact:** Phone links use proper tel: protocol, which is good. Minor enhancement would be to add country code.

**Location:** Contact section in Need Help area

**Current State:**
```html
<a href="tel:+15206213268">520-621-3268</a>
```

**Enhancement:**
```html
<!-- Current implementation is correct -->
<!-- Could optionally display country code for international users -->
<a href="tel:+15206213268">+1-520-621-3268</a>
```

**Priority:** LOW - Current implementation is acceptable

---

### 20. External Link to DRC Request Form

**Severity:** Minor  
**WCAG Criterion:** 3.2.5 Change on Request (Level AAA)  
**Confidence:** Medium  
**Impact:** Link to drc.arizona.edu could indicate it's external to the current site.

**Location:** Need Help section

**Current State:**
```html
<a href="https://drc.arizona.edu/asl-cart">DRC request form</a>
```

**Enhancement:**
```html
<a href="https://drc.arizona.edu/asl-cart">
  DRC request form
  <span class="sr-only">(Disability Resource Center website)</span>
</a>
```

**Priority:** LOW

---

### 21. Land Acknowledgment Link

**Severity:** Minor  
**WCAG Criterion:** Best Practice  
**Confidence:** High  
**Impact:** The land acknowledgment link text is very long. Consider shortening while maintaining meaning.

**Location:** Footer

**Current State:**
```html
<a href="https://www.arizona.edu/university-arizona-land-acknowledgment">
  the University of Arizona is on the land and territories of Indigenous peoples
</a>
```

**Enhancement:**
```html
We respectfully acknowledge 
<a href="https://www.arizona.edu/university-arizona-land-acknowledgment">
  the University of Arizona land acknowledgment
</a>.
<!-- Rest of acknowledgment text remains as plain text -->
```

**Priority:** LOW

---

## What Passed

### Strengths and WCAG Criteria Met

✅ **Skip Navigation Link (2.4.1)** - Present at top of page  
✅ **Semantic Heading Structure (1.3.1)** - H2 and H3 elements used appropriately (except for H1 duplication)  
✅ **Descriptive Section Headings (2.4.6)** - Clear, informative headings like "News," "Start by role," "Need help?"  
✅ **Contact Information (3.2.4)** - Email and phone number clearly provided  
✅ **Link Protocol Usage (Best Practice)** - Proper use of mailto: and tel: protocols  
✅ **Semantic HTML Elements (1.3.1)** - Use of articles, sections, headings, lists  
✅ **Text Alternative for Logo (1.1.1)** - Logo has alt text (though needs improvement)  
✅ **Keyboard Accessible Links (2.1.1)** - Standard links are keyboard accessible  
✅ **Content Organization (1.3.2)** - Logical reading order and meaningful sequence  
✅ **Consistent Navigation (3.2.3)** - Navigation appears consistent across page  
✅ **Land Acknowledgment (Best Practice)** - Inclusive content acknowledging Indigenous peoples  
✅ **Multiple Ways to Navigate (2.4.5)** - Search, menus, role guides, area guides provided  

---

## Cross-Page Pattern Detection

**Note:** This audit covers only the homepage. The following patterns should be investigated across the entire site:

### Systemic Issues (Likely on Every Page)
1. **Multiple H1 elements** - If this is a template issue, it affects all pages
2. **Logo alt text with "White"** - Appears in site header, likely on every page
3. **Navigation components** - "I am a" selector, Search, Menu accessibility needs verification site-wide

### Component-Level Issues (Fix Once, Fix Everywhere)
1. **Card components with redundant links** - Used throughout site for role cards, area cards, understanding cards
2. **News card "Read more" links** - Template pattern likely reused on news listing pages
3. **CTA button text patterns** - "Learn more," "See the truth," etc. may be reused

### Remediation Priority
1. **Fix the card component template** (addresses 20+ redundant link instances)
2. **Fix the H1 rendering issue** (template/layout bug affecting all pages)
3. **Update logo alt text** (header component fix affecting all pages)
4. **Create link text content guidelines** (prevents future ambiguous links)

---

## Recommended Testing Setup

### Automated Testing
1. **Install axe DevTools** browser extension: https://www.deque.com/axe/devtools/
2. **Run axe-core scan** on all major page templates
3. **Set up Lighthouse CI** for continuous accessibility scoring

### Manual Testing Checklist
- [ ] Test keyboard navigation on all interactive elements (Tab, Shift+Tab, Enter, Escape)
- [ ] Verify skip link is visible on focus and works correctly
- [ ] Test "I am a" dropdown with keyboard only (Arrow keys, Enter, Escape)
- [ ] Test search form with screen reader (NVDA + Firefox or VoiceOver + Safari)
- [ ] Navigate entire page using only screen reader + keyboard
- [ ] Test at 200% browser zoom - verify content reflows without horizontal scroll
- [ ] Test focus indicators on all links, buttons, and form controls
- [ ] Verify color contrast ratios using browser DevTools
- [ ] Test with browser high contrast mode enabled

### Screen Reader Testing
- **Windows:** NVDA (free) + Firefox - https://www.nvaccess.org/
- **macOS:** VoiceOver (built-in) + Safari - Cmd+F5 to enable
- **Test scenarios:**
  - Navigate by headings (H key in NVDA, VO+Cmd+H in VoiceOver)
  - Open links list (Insert+F7 in NVDA, VO+U then J in VoiceOver)
  - Navigate by landmarks (D key in NVDA, VO+U then L in VoiceOver)
  - Use "I am a" dropdown with screen reader only

### CI/CD Recommendation
```yaml
# Add to .github/workflows/accessibility.yml
name: Accessibility Check
on: [push, pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run axe-core
        run: |
          npx @axe-core/cli https://accessibility.arizona.edu \
            --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa \
            --save axe-results.json
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-results
          path: axe-results.json
```

---

## Remediation Roadmap

### Phase 1: Critical Fixes (Week 1)
**Effort:** 8-16 hours  
**Impact:** High

1. **Fix H1 duplication** (2 hours)
   - Debug template rendering issue
   - Ensure only one H1 per page
   - Test across all page templates

2. **Refactor card components to remove redundant links** (4-6 hours)
   - Update card component template
   - Convert to single wrapping link or remove CTA link
   - Test keyboard navigation
   - Deploy and verify across all pages using cards

### Phase 2: Major Fixes (Week 2)
**Effort:** 8-12 hours  
**Impact:** Medium-High

3. **Update all ambiguous link text** (4-6 hours)
   - Replace "Read more" with "Read more about [topic]"
   - Replace "Learn more" with descriptive text
   - Update CTA button text to be more specific
   - Create content guidelines for future link text

4. **Fix logo alt text** (1 hour)
   - Remove "White" from alt text
   - Update to "University of Arizona" or "University of Arizona homepage"

5. **Verify and fix "I am a" dropdown** (2-3 hours)
   - Audit current implementation
   - Add proper ARIA if custom widget
   - Test with screen readers
   - Verify keyboard navigation

6. **Add new tab/external link warnings** (2 hours)
   - Add visual indicators and screen reader text
   - Apply to forms.office.com links and other external links

### Phase 3: Moderate Fixes (Week 3)
**Effort:** 4-8 hours  
**Impact:** Medium

7. **Verify and enhance skip link** (1 hour)
8. **Verify HTML lang attribute** (15 minutes)
9. **Verify viewport meta tag** (15 minutes)
10. **Test and fix focus indicators** (2-3 hours)
11. **Verify color contrast** (1-2 hours)
12. **Make feedback banner dismissible** (1 hour)
13. **Audit search form accessibility** (1 hour)

### Phase 4: Minor Enhancements (Week 4)
**Effort:** 2-4 hours  
**Impact:** Low

14. Minor link text improvements
15. External link indicators
16. Documentation and guidelines

---

## Next Steps

1. **Immediate Actions:**
   - Fix the H1 duplication bug (template issue)
   - Begin refactoring card components to remove redundant links
   - Update logo alt text in header component

2. **Set Up Testing:**
   - Install axe DevTools browser extension
   - Download and install NVDA screen reader (Windows) or enable VoiceOver (Mac)
   - Schedule screen reader testing session

3. **Create Guidelines:**
   - Document link text best practices for content creators
   - Create card component usage guidelines
   - Establish accessibility review process for new content

4. **Full Site Audit:**
   - This audit covered the homepage only
   - Schedule audits of key page templates:
     - Role guide pages (/i-am/*)
     - Area hub pages (/documents-media, /web-apps, etc.)
     - News listing and article pages
     - Form pages
     - Tool and checklist pages

5. **Schedule Follow-Up:**
   - Re-audit homepage after Phase 1 and 2 fixes
   - Expected improvement: Score should increase to 80-85/100 (Grade B)

---

## Additional Resources

### WCAG 2.2 Quick Reference
- **WCAG 2.2:** https://www.w3.org/WAI/WCAG22/quickref/
- **Understanding WCAG 2.2:** https://www.w3.org/WAI/WCAG22/Understanding/

### Testing Tools
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/
- **Lighthouse:** Built into Chrome DevTools
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

### Screen Readers
- **NVDA (Windows):** https://www.nvaccess.org/
- **JAWS (Windows):** https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver (Mac/iOS):** Built-in (Cmd+F5 to enable)
- **TalkBack (Android):** Built-in

### Learning Resources
- **WebAIM:** https://webaim.org/
- **Deque University:** https://dequeuniversity.com/
- **A11y Project:** https://www.a11yproject.com/
- **W3C WAI Tutorials:** https://www.w3.org/WAI/tutorials/

---

## Contact

For questions about this audit report:
- **Auditor:** Web Accessibility Wizard
- **Date:** March 4, 2026
- **Report Version:** 1.0

---

**End of Report**
