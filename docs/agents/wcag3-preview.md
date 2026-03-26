# wcag3-preview — WCAG 3.0 Working Draft Education

> Educational agent covering the WCAG 3.0 Working Draft, including the APCA contrast algorithm, new conformance model, outcome-based testing, and functional needs categories.
>
> **Draft disclaimer:** WCAG 3.0 is a W3C Working Draft and is not yet a recommendation. All content reflects the draft specification as of the latest available version. Requirements, scoring models, and terminology may change significantly before final publication. Do not use WCAG 3.0 draft criteria for compliance claims — use WCAG 2.2 for current conformance requirements.

## Features

- Explains the APCA (Accessible Perceptual Contrast Algorithm) contrast model and how it differs from WCAG 2.x luminance contrast
- Covers the new Bronze/Silver/Gold conformance model replacing A/AA/AAA
- Describes outcome-based testing methodology versus technique-based testing
- Explains functional needs categories (vision, hearing, cognitive, motor, speech)
- Delta analysis mode: evaluates existing WCAG 2.x audit reports against proposed WCAG 3.0 changes
- Side-by-side comparison of WCAG 2.2 versus WCAG 3.0 approaches for specific criteria
- Tracks Working Draft updates and highlights what changed between draft versions

## When to Use It

- Learning about WCAG 3.0 concepts before the standard is finalized
- Understanding how APCA contrast differs from current WCAG 2.x contrast ratios
- Exploring how the Bronze/Silver/Gold model would apply to your product
- Running delta analysis on an existing audit to preview how WCAG 3.0 might affect results
- Preparing a team for the eventual transition from WCAG 2.x to 3.0
- Comparing specific success criteria between WCAG 2.2 and the WCAG 3.0 draft

## How It Works

1. **Topic selection** — Choose a WCAG 3.0 concept to explore (APCA, conformance, outcomes, functional needs)
2. **Explanation** — Provides a clear explanation of the concept with examples
3. **Comparison** — Shows how the concept relates to or differs from WCAG 2.2
4. **Delta analysis** (optional) — Takes an existing audit report and identifies findings that would be evaluated differently under WCAG 3.0

## Handoffs

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When a team wants to understand future WCAG direction |
| Receives from | contrast-master | When exploring APCA as a future contrast evaluation method |
| Hands off to | accessibility-lead | When WCAG 3.0 education leads to a current WCAG 2.2 audit need |
| Hands off to | contrast-master | When APCA discussion requires current contrast ratio evaluation |
| Hands off to | wcag-guide | When users need definitive guidance on current WCAG 2.2 criteria |

## Sample Usage

```text
@wcag3-preview Explain how APCA contrast differs from WCAG 2.x contrast ratios

@wcag3-preview What is the Bronze/Silver/Gold conformance model?

@wcag3-preview Run delta analysis on our existing audit report against WCAG 3.0 draft changes

@wcag3-preview Compare how color contrast is evaluated in WCAG 2.2 versus WCAG 3.0
```

## Related

- [contrast-master](contrast-master.md) — Evaluates current WCAG 2.x contrast ratios; consult for production compliance
- [wcag-guide](wcag-guide.md) — Authoritative guidance on current WCAG 2.2 success criteria
- [accessibility-lead](accessibility-lead.md) — Coordinates full audits using current WCAG 2.2 standards
