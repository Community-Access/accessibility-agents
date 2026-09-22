# wcag-aaa — WCAG 2.2 Level AAA Auditor

> Audits web content against WCAG 2.2 Level AAA success criteria, covering enhanced requirements beyond the AA baseline.

## Features

- Audits all Level AAA success criteria from WCAG 2.2
- Enhanced contrast evaluation (7:1 for normal text, 4.5:1 for large text)
- Extended audio description checks for prerecorded video (1.2.7)
- Sign language interpretation requirements (1.2.6)
- Reading level analysis targeting lower secondary education level (3.1.5)
- Abbreviation expansion detection (3.1.4)
- Pronunciation guidance checks (3.1.6)
- Focus appearance enhanced requirements (2.4.13)
- Target size minimum 44x44 CSS pixels (2.5.5)
- Context-sensitive help detection (3.3.5)
- Error prevention for all submissions, not just legal/financial (3.3.6)
- Prerequisite verification: confirms AA conformance before AAA audit

## When to Use It

- Your organization targets AAA conformance for specific content areas
- Evaluating content intended for audiences with specific accessibility needs
- Government or public sector projects requiring enhanced accessibility
- Educational institutions aiming for maximum content accessibility
- After achieving AA conformance and wanting to identify AAA improvement opportunities
- Accessibility maturity assessments where AAA criteria serve as stretch goals

## How It Works

1. **Prerequisite check** — Confirms the page or component has been audited at AA level first; if not, defers to accessibility-lead for baseline audit
2. **Scope definition** — Identifies which pages, components, or content areas to audit at AAA
3. **Criteria evaluation** — Evaluates each AAA success criterion against the target content
4. **Finding classification** — Reports findings with WCAG criterion reference, severity, and remediation guidance
5. **Priority assessment** — Ranks findings by impact and feasibility, noting that full AAA conformance is rarely expected for entire sites

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When AA audit is complete and team wants to pursue AAA goals |
| Receives from | contrast-master | When enhanced contrast checks (7:1) are specifically requested |
| Hands off to | accessibility-lead | When prerequisite AA audit has not been completed |
| Hands off to | contrast-master | When detailed contrast analysis is needed for 7:1 threshold evaluation |
| Hands off to | cognitive-accessibility | When reading level or cognitive criteria need deeper analysis |

## Sample Usage

```text
@wcag-aaa Audit the homepage for WCAG 2.2 AAA compliance

@wcag-aaa Check enhanced contrast ratios across all text on this page

@wcag-aaa Evaluate reading level of the content in docs/getting-started.md

@wcag-aaa What AAA criteria apply to our video player component?
```

## Related

- [accessibility-lead](./accessibility-lead.md) — Runs baseline AA audits that are prerequisite to AAA evaluation
- [contrast-master](./contrast-master.md) — Handles detailed contrast ratio analysis including enhanced 7:1 thresholds
- [cognitive-accessibility](./cognitive-accessibility.md) — Provides deeper analysis for reading level and cognitive AAA criteria
- [wcag-guide](./wcag-guide.md) — Explains individual WCAG success criteria at all conformance levels
