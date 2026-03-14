# Source Citation Policy

This policy applies to **all agents** in the accessibility-agents ecosystem. Every agent MUST follow these rules when providing factual claims, recommendations, or detection rules.

## Authority Hierarchy

When citing sources, prefer higher-tier sources. Higher tiers override lower tiers when there is a conflict.

| Tier | Source Type | Examples |
|------|-----------|----------|
| 1 | Normative Specs | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), [HTML Living Standard](https://html.spec.whatwg.org/) |
| 2 | Informative Guidance | [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) |
| 3 | Platform Vendor Docs | [MDN Web Docs](https://developer.mozilla.org/), [Microsoft Learn](https://learn.microsoft.com/), [Apple Developer](https://developer.apple.com/accessibility/), [wxWidgets Docs](https://docs.wxwidgets.org/), [wxPython Docs](https://docs.wxpython.org/) |
| 4 | AT Vendor Docs | [NV Access (NVDA)](https://www.nvaccess.org/files/nvda/documentation/userGuide.html), [Freedom Scientific (JAWS)](https://support.freedomscientific.com/), [Apple VoiceOver](https://support.apple.com/guide/voiceover/) |
| 5 | Peer-Reviewed / Established | [Deque University](https://dequeuniversity.com/), [WebAIM](https://webaim.org/), [The Paciello Group](https://www.tpgi.com/), [Adrian Roselli's Blog](https://adrianroselli.com/) |
| 6 | Government/Legal | [Section508.gov](https://www.section508.gov/), [Access Board ICT](https://www.access-board.gov/ict/), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) |

## Core Rules

### 1. No Source, No Claim

If the agent cannot link to an authoritative source for a factual assertion, it MUST explicitly state:

> "This recommendation is based on practical accessibility testing experience and is not codified in a published standard."

### 2. Inline Citation Format

Cite sources inline using markdown links:

```text
[WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)
```

### 3. Sources Section

Every substantive response ends with a `## Sources` section listing all cited references with full URLs:

```markdown
## Sources

- [WAI-ARIA 1.2 Specification](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.2 Success Criterion 4.1.3: Status Messages](https://www.w3.org/TR/WCAG22/#status-messages)
```

### 4. Recency Preference

Prefer current specifications and documentation versions:

- WCAG 2.2 over WCAG 2.1
- WAI-ARIA 1.2 over WAI-ARIA 1.1
- Current screen reader documentation over archived versions
- Latest platform vendor docs over older releases

### 5. Conflict Resolution

When sources disagree:

1. Cite both sources and note the conflict
2. Normative specs (Tier 1) outrank all others
3. Informative guidance (Tier 2) outranks vendor docs (Tier 3)
4. State which interpretation the agent is following and why

## Per-Agent Source Registry

Each agent domain has designated primary authoritative sources. Agents MUST prefer these over generic web search results.

| Agent Domain | Primary Sources |
|---|---|
| WCAG / General Web | w3.org/TR/WCAG22/, w3.org/WAI/WCAG22/Understanding/, w3.org/WAI/ARIA/apg/ |
| ARIA Patterns | w3.org/WAI/ARIA/apg/patterns/, w3.org/TR/wai-aria-1.2/ |
| Color Contrast | w3.org/TR/WCAG22/#contrast-minimum, w3.org/TR/WCAG22/#contrast-enhanced |
| wxPython | docs.wxpython.org, docs.wxwidgets.org, wiki.wxpython.org |
| Desktop Accessibility | learn.microsoft.com/windows/win32/winauto/, developer.apple.com/accessibility/ |
| NVDA Addons | nvaccess.org docs, github.com/nvaccess/nvda (source), github.com/nvdaaddons/DevGuide |
| Screen Readers | nvaccess.org, support.freedomscientific.com, support.apple.com/guide/voiceover/ |
| PDF/UA | pdfa.org, iso.org 14289-1/2 |
| Mobile | developer.apple.com/accessibility/, developer.android.com/guide/topics/ui/accessibility/ |
| Section 508 | section508.gov, access-board.gov/ict/ |
| Markdown | github.github.com/gfm/, commonmark.org |
| Document Accessibility | support.microsoft.com/accessibility, adobe.com/accessibility |

## Staying Current

When providing recommendations based on specifications or documentation that may have been updated since training data:

1. Use `context7` MCP server to fetch current library documentation for framework-specific advice
2. Use `fetch_webpage` to verify specific WCAG/ARIA specification content when the user asks about edge cases or recent changes
3. Always note the version of the specification being cited
4. If currency cannot be verified, state: "This is based on [spec version X]. Check [URL] for the latest version."

## Source Fingerprint Registry

The machine-readable source registry at `.github/agents/SOURCE_REGISTRY.json` tracks authoritative URLs with content fingerprints. A weekly GitHub Actions workflow checks these sources for changes and opens issues when updates are detected. See the [source-currency-check workflow](../.github/workflows/source-currency-check.yml) for details.
