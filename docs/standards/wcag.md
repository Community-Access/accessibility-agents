# WCAG 2.2

The standard every finding is measured against, and the one this package
exists to enforce.

| | |
|---|---|
| Specification | <https://www.w3.org/TR/WCAG22/> |
| Status | W3C Recommendation, 5 October 2023, revised 12 December 2024 |
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
| Focus managed on route change, dynamic content and deletion | 2.4.3 Focus Order, 2.4.11 Focus Not Obscured |
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
minority of accessibility barriers. A passing score is a floor. The
`testing-coach` and `desktop-a11y-testing-coach` skills exist to plan the
manual screen reader and keyboard passes that the score cannot replace.

## Beyond 2.2

`wcag3-preview` explains the draft W3C Accessibility Guidelines 3.0, including
the APCA contrast algorithm exposed by the `check_apca_contrast` tool. Nothing
in this package treats 3.0 as normative, and that tool's description says so.

## Sources

- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- Understanding documents: <https://www.w3.org/WAI/WCAG22/Understanding/>
- What is new in 2.2: <https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>
- WAI-ARIA 1.2: <https://www.w3.org/TR/wai-aria-1.2/>
- ARIA Authoring Practices: <https://www.w3.org/WAI/ARIA/apg/>
