# WCAG 2.2

The standard every finding is measured against, and the one this package
exists to enforce.

| | |
|---|---|
| Specification | <https://www.w3.org/TR/WCAG22/> |
| Status | W3C Recommendation, 5 October 2023, revised 12 December 2024 (still the latest dated version; later errata are editorial). Also published as ISO/IEC 40500:2025, which matches the October 2023 text |
| Steward | W3C Accessibility Guidelines Working Group |
| Target level | AA, with AAA available through `wcag-aaa` |
| Governs here | the `wcag` field of every finding, and the checklists in every specialist |
| Checked by | `skills/a11y-core/scripts/test-findings-contract.mjs` against `skills/a11y-core/schemas/wcag22-criteria.json` |

## How a criterion is cited

A finding's `wcag` field is the criterion number and level, `1.3.1 A`, or
`n/a` for a defect outside WCAG. The contract test rejects three things:

| Rejected | Why |
|---|---|
| A number not in WCAG 2.2 | an invented criterion looks authoritative and survives into a compliance document |
| A level that does not match the criterion | `1.4.3 A` would understate what conformance requires |
| `4.1.1 Parsing` | obsoleted in 2.2; citing it in a 2.2 audit is an error |

The criterion list is a committed file, `wcag22-criteria.json`, with every
success criterion's number, name and level, and the obsoleted one recorded
separately. It is the one place the numbers live.

## The eight standards that are not traded away

`AGENTS.md` names eight rules every web skill holds without being told. Each
maps to a criterion.

| Rule | Criterion |
|---|---|
| Semantic HTML before ARIA | 4.1.2 Name, Role, Value |
| One H1 per page, no skipped levels | 1.3.1 Info and Relationships, 2.4.6 Headings and Labels |
| Every interactive element reachable and operable by keyboard | 2.1.1 Keyboard, 2.1.2 No Keyboard Trap |
| Text contrast 4.5 to 1, components 3 to 1 | 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast |
| No information by colour alone | 1.4.1 Use of Color |
| Focus managed on route change, dynamic content and deletion | 2.4.3 Focus Order, 2.4.11 Focus Not Obscured (Minimum) |
| Dialogs trap focus and return it on close | 2.1.2, 2.4.3 |
| Dynamic updates are announced | 4.1.3 Status Messages |

## Severity, and why it is not the same as level

WCAG levels say what conformance requires. Severity says what a person
experiences. A finding carries both: the criterion and its level in `wcag`,
and one of `critical`, `serious`, `moderate`, `minor` in `severity`, with
weights of 10, 5, 2 and 1 in the score. One critical finding outweighs eight
minor ones on purpose, because one critical finding locks a person out.

## What automated checks cannot do

Every report says so in its next-steps section: automated checks find a
minority of accessibility barriers. A passing score is a floor.

For WCAG 2.2 in particular, axe-core 4.14 has one rule for a 2.2 criterion,
`target-size` (2.5.8 Target Size (Minimum)), and it runs only when the tag
list includes `wcag22aa`. The full AA tag set is
`wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa`. The other new 2.2 criteria at A and AA (2.4.11, 2.5.7,
3.2.6, 3.3.7, 3.3.8) have no axe rule and need manual testing. The
`testing-coach` and `desktop-a11y-testing-coach` skills exist to plan the
manual screen reader and keyboard passes that the score cannot replace.

## Beyond 2.2

`wcag3-preview` explains the draft W3C Accessibility Guidelines 3.0, whose
latest Working Draft is dated 10 September 2026. W3C does not expect it to be
a completed standard for a few more years. The draft has a single conformance
level (meet every core requirement) with reporting tiers, not Bronze, Silver
and Gold, and its text contrast requirements leave the contrast measure "to be
determined"; it does not name APCA.

The `check_apca_contrast` tool computes APCA, a contrast algorithm that has
been proposed for WCAG 3 but is not part of the current draft or of any W3C
standard. Nothing in this package treats 3.0 or APCA as normative.

## Sources

- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- Understanding documents: <https://www.w3.org/WAI/WCAG22/Understanding/>
- What is new in 2.2: <https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>
- WCAG 3.0 Working Draft: <https://www.w3.org/TR/wcag-3.0/>
- ISO/IEC 40500:2025: <https://www.iso.org/standard/91029.html>
- WAI-ARIA 1.2: <https://www.w3.org/TR/wai-aria-1.2/>
- ARIA Authoring Practices: <https://www.w3.org/WAI/ARIA/apg/>
