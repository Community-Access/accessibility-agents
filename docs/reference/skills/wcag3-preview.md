# wcag3-preview - WCAG 3.0 Working Draft Education

> Educational skill covering the WCAG 3.0 Working Draft (latest dated 10 September 2026): its requirements model (core requirements, supplemental requirements and assertions), its conformance model, its open contrast question, and functional needs.
>
> **Draft disclaimer:** WCAG 3.0 is a W3C Working Draft and is not yet a recommendation. All content reflects the draft specification as of the latest available version. Requirements, scoring models, and terminology may change significantly before final publication. Do not use WCAG 3.0 draft criteria for compliance claims; use WCAG 2.2 for current conformance requirements.

## Features

- Explains where text contrast stands in the draft: the measure is still "to be determined" and the draft does not name APCA, although APCA has been proposed; the `check_apca_contrast` tool computes APCA for comparison only
- Covers the draft's conformance model: one conformance level (meet every core requirement), with reporting tiers above and below it. Earlier drafts proposed Bronze, Silver and Gold; the current draft does not use them
- Describes how requirements are tested in the draft, compared with WCAG 2.x success criteria and techniques
- Explains functional needs categories (vision, hearing, cognitive, motor, speech)
- Delta analysis mode: evaluates existing WCAG 2.x audit reports against proposed WCAG 3.0 changes
- Side-by-side comparison of WCAG 2.2 versus WCAG 3.0 approaches for specific criteria
- Tracks Working Draft updates and highlights what changed between draft versions

## When to Use It

- Learning about WCAG 3.0 concepts before the standard is finalized
- Understanding how a perceptual contrast measure such as APCA would differ from current WCAG 2.x contrast ratios
- Exploring how the draft's conformance level and reporting tiers would apply to your product
- Running delta analysis on an existing audit to preview how WCAG 3.0 might affect results
- Preparing a team for the eventual transition from WCAG 2.x to 3.0
- Comparing specific success criteria between WCAG 2.2 and the WCAG 3.0 draft

## How It Works

1. **Topic selection**: choose a WCAG 3.0 concept to explore (contrast, conformance, requirements, functional needs)
2. **Explanation**: provides a clear explanation of the concept with examples
3. **Comparison**: shows how the concept relates to or differs from WCAG 2.2
4. **Delta analysis** (optional): takes an existing audit report and identifies findings that would be evaluated differently under WCAG 3.0

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When a team wants to understand future WCAG direction |
| Receives from | contrast-master | When exploring perceptual contrast (such as APCA) as a possible future method |
| Hands off to | accessibility-lead | When WCAG 3.0 education leads to a current WCAG 2.2 audit need |
| Hands off to | contrast-master | When a contrast discussion needs current WCAG 2.x contrast ratio evaluation |
| Hands off to | wcag-guide | When users need definitive guidance on current WCAG 2.2 criteria |

## Sample Usage

```text
/wcag3-preview Explain how a perceptual contrast measure such as APCA differs from WCAG 2.x contrast ratios

/wcag3-preview How does conformance work in the current WCAG 3.0 draft?

/wcag3-preview Run delta analysis on our existing audit report against WCAG 3.0 draft changes

/wcag3-preview Compare how color contrast is evaluated in WCAG 2.2 versus WCAG 3.0
```

## Related

- [contrast-master](./contrast-master.md): evaluates current WCAG 2.x contrast ratios; consult for production compliance
- [wcag-guide](./wcag-guide.md): authoritative guidance on current WCAG 2.2 success criteria
- [accessibility-lead](./accessibility-lead.md): coordinates full audits using current WCAG 2.2 standards
