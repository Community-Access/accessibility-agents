# Authoritative Sources for Accessibility Rules

All accessibility rules, WCAG criteria, and remediation guidance in the agents platform are grounded in authoritative sources. This document maps agent recommendations to their original sources.

## Web Accessibility (WCAG 2.2)

### Primary Authority
- **WCAG 2.2 Specification** — W3C official standard
  - Link: https://www.w3.org/WAI/WCAG22/
  - Conformance levels: A, AA, AAA
  - Published: October 5, 2023
  - Latest: https://www.w3.org/TR/WCAG22/

### Implementation Guidance
- **Web Content Accessibility Guidelines Understanding Documents** — W3C
  - Link: https://www.w3.org/WAI/WCAG22/Understanding/
  - Explains each success criterion with examples and techniques
  
- **Accessible Rich Internet Applications (ARIA) 1.2** — W3C
  - Link: https://www.w3.org/TR/wai-aria-1.2/
  - Define roles, states, properties for accessible custom widgets
  - Used by: aria-specialist, keyboard-navigator, modal-specialist agents

### Technical Rules & Tools
- **axe DevTools Rules** — Accessibility Insights
  - Link: https://accessibilityinsights.io/info-examples/web/
  - Provides rule IDs, WCAG mappings, impact assessments
  - Used by: web-accessibility-wizard, cross-page-analyzer agents
  - Coverage: 80+ rules across all WCAG success criteria

- **axe-core on GitHub** — Deque Systems
  - Link: https://github.com/dequelabs/axe-core
  - Open-source accessibility testing engine
  - Rule definitions and automated test implementations

## Document Accessibility (PDF/UA, Office)

### PDF Accessibility
- **PDF/UA-1 Specification** — International Organization for Standardization (ISO)
  - Link: https://www.pdfa.org/pdfua/
  - Standard for universally accessible PDF documents
  - Published: ISO 14289-1:2014-07
  - Latest: ISO 14289-1:2023

- **Matterhorn Protocol** — PDF Association
  - Link: https://www.pdfa.org/matterhorn/
  - Provides 40+ rules for PDF/UA conformance testing
  - Organized in three layers: conformance, best practices, quality

### Office Documents (Word, Excel, PowerPoint)
- **Microsoft Accessibility Checker Rules** — Microsoft Docs
  - Link: https://support.microsoft.com/en-us/office/use-the-accessibility-checker-to-find-accessibility-issues-6d4ee7f0-5783-465a-85a6-3ea1a1e5606f
  - Built-in Office accessibility standards
  - Mapped to WCAG 2.1 AA

- **Microsoft Office Accessibility Guidance** — Microsoft Docs
  - Word: https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-a084-4c31-9ed2-60a20beac772
  - Excel: https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-47003059-bda5-466b-913d-fe0065038517
  - PowerPoint: https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7db7eb-d335-4b7e-835c-f373f9099e3e

### WCAG Conformance for Documents
- **WCAG 2.1 AA for Office** — W3C / Microsoft collaboration
  - Office document rules must conform to WCAG 2.1 AA minimum
  - Non-text content (images): WCAG 1.1.1
  - Semantics (headings, lists): WCAG 1.3.1
  - Color contrast: WCAG 1.4.3
  - Link purpose: WCAG 2.4.4

## Markdown Documentation Accessibility

### WCAG 2.2 for Markdown
- **WCAG 2.2 Understanding Links** — W3C
  - Link: https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html
  - Rule: 2.4.9 "Link Purpose (Link Only)"
  - Applies to markdown hyperlinks

- **WCAG 2.2 Understanding Headings** — W3C
  - Link: https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html
  - Rule: 2.4.10 "Section Headings"
  - Applies to markdown heading structure

### Markdown Processing Standards
- **Markdown Specification** — CommonMark
  - Link: https://spec.commonmark.org/
  - Standard markdown syntax and parsing
  - Used by most documentation tools

- **GitHub Flavored Markdown** — GitHub Docs
  - Link: https://github.github.com/gfm/
  - Extends CommonMark with tables, strikethrough, autolinks
  - Used by most documentation platforms

## Desktop Application Accessibility

### Platform-Specific Standards
- **Windows UI Automation (UIA)** — Microsoft Docs
  - Link: https://docs.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32
  - Standard for Windows desktop accessibility
  - Screen reader (JAWS, Narrator) integration

- **macOS NSAccessibility** — Apple Docs
  - Link: https://developer.apple.com/documentation/appkit/nsaccessibility
  - Standard for macOS native app accessibility
  - Screen reader (VoiceOver) integration

- **Linux ATK/AT-SPI** — GNOME / Linux Accessibility
  - Link: https://docs.gtk.org/atspi2/
  - Assistive Technology Service Provider Interface
  - Screen reader (Orca) integration

### WCAG 2.2 for Desktop
- **WCAG 2.2 Understanding for Non-Web Content** — W3C
  - Link: https://www.w3.org/WAI/WCAG22/Understanding/
  - Applicability notes for desktop applications
  - Applies to wxPython, Qt, Electron-based apps

## Plain Language & Cognitive Accessibility

### WCAG 2.2 Cognitive Accessibility
- **WCAG 2.2 Success Criteria 3.3.7, 3.3.8, 3.3.9** — W3C
  - Link: https://www.w3.org/WAI/WCAG22/Understanding/
  - Redundant Entry, Accessible Authentication (Minimum & Enhanced)
  - Published: October 5, 2023

- **Cognitive Accessibility Guidance (COGA)** — W3C
  - Link: https://www.w3.org/TR/coga-usable/
  - Non-normative guidance on designing for cognitive disabilities
  - Includes personas, barriers, techniques

### Reading Level & Plain Language
- **Plain Language in Government** — U.S. government plainlanguage.gov
  - Link: https://www.plainlanguage.gov/guidelines/
  - Evidence-based guidance for clear writing
  - Applies to WCAG 2.2 SC 3.1.5 / COGA

- **Flesch-Kincaid Readability** — Wikipedia
  - Link: https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests
  - Industry-standard reading level metric
  - Grade level estimates for text

## Mobile Accessibility (React Native, iOS, Android)

### React Native
- **React Native Accessibility** — Meta Docs
  - Link: https://reactnative.dev/docs/accessibility
  - `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`
  - Supported on iOS (VoiceOver) and Android (TalkBack)

### iOS Native (SwiftUI, UIKit)
- **Apple Accessibility for Developers** — Apple Docs
  - Link: https://developer.apple.com/accessibility/
  - SwiftUI modifier: `.accessibilityLabel()`, `.accessibilityRole()`
  - VoiceOver testing guidance

### Android Native (Jetpack Compose, Views)
- **Android Accessibility** — Google Docs
  - Link: https://developer.android.com/guide/topics/ui/accessibility
  - `android:contentDescription`, `android:accessibilityLiveRegion`
  - TalkBack screen reader integration

## Testing & Validation Tools

### Automated Testing
- **Playwright Testing Library** — Microsoft
  - Link: https://playwright.dev/
  - Recommend for accessibility test automation

- **axe-core API** — Deque Systems
  - Link: https://github.com/dequelabs/axe-core
  - Programmatic accessibility testing

- **pa11y CLI** — pa11y project
  - Link: https://pa11y.org/
  - Command-line accessibility testing with axe-core

### Screen Reader Testing
- **NVDA (NonVisual Desktop Access)** — NV Access
  - Link: https://www.nvaccess.org/
  - Free, open-source Windows screen reader
  - For testing desktop and web apps

- **JAWS (Job Access With Speech)** — Freedom Scientific
  - Link: https://www.freedomscientific.com/products/software/jaws/
  - Commercial Windows screen reader
  - Industry standard for professional testing

- **VoiceOver** — Apple
  - Link: https://www.apple.com/accessibility/voiceover/
  - Built into macOS, iOS, iPadOS
  - For testing on Apple platforms

- **Orca** — GNOME / Linux Accessibility
  - Link: https://help.gnome.org/users/orca/
  - Free screen reader for Linux
  - For testing on Linux platforms

## Source Validation

### How Sources Are Maintained

All agent recommendations cite sources using one of these formats:

**In-line citation:**
```
See WCAG 2.4.4 (Link Purpose in Context) at 
https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html
```

**Structured source block:**
```markdown
## Recommended By
- **WCAG 2.2 Success Criterion 2.4.4** 
  https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html
- **axe Rule ID**: link-name
  https://accessibilityinsights.io/info-examples/web/link-name/
```

### Link Rot Detection

The `verify-sources.yml` GitHub Actions workflow automatically:
1. Extracts all `https://...` links from agent files
2. Tests HTTP response codes (200 = valid, 404 = broken, 403 = redirected)
3. Reports broken links in CI workflow
4. Creates issues for link maintenance

**Run manually:**
```bash
scripts/verify-sources.sh  # Bash/Linux
scripts/verify-sources.ps1 # PowerShell/Windows
```

## Migration Guide: Citing Sources

When updating agents or adding new rules:

1. **Identify the source** — WCAG criterion, rule ID, or platform standard
2. **Find the official URL** — W3C, Accessibility Insights, Microsoft, Apple, Google
3. **Add citation** — Use inline or structured format above
4. **Test the link** — Only external `https://` links that return 200 OK

**Example: Adding ARIA guidance**
```
Rule: Custom widget lacks proper ARIA role
Source: WAI-ARIA 1.2, "Design Patterns and Widgets"
Link: https://www.w3.org/TR/wai-aria-1.2/#design_patterns
Citation: See WAI-ARIA 1.2 design patterns at https://www.w3.org/TR/wai-aria-1.2/#design_patterns
```

---

**See also:**
- [Context Management Guide](./context-management.md) - Managing long audit conversations
- [Custom Skills Guide](./create-custom-skills.md) - Extending agents with custom rules
