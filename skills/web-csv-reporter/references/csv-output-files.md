# Web CSV Reporter reference: CSV Output Files

Part of the `web-csv-reporter` skill. Read this only when the task reaches these sections.

## CSV Output Files

Generate the following CSV files in the current working directory (or user-specified directory):

### 1. WEB-ACCESSIBILITY-FINDINGS.csv

Primary findings export with one row per issue instance.

**Columns (in order):**

| Column | Description | Example |
|--------|------------|---------|
| `finding_id` | Unique identifier (auto-increment) | `WEB-001` |
| `page_url` | Page where the issue was found | `/index.html` |
| `severity` | Critical, Serious, Moderate, Minor | `Serious` |
| `confidence` | High, Medium, Low | `High` |
| `score_impact` | Points deducted from page score | `-7` |
| `wcag_criteria` | WCAG 2.2 success criterion | `1.1.1` |
| `wcag_level` | A, AA | `A` |
| `rule_id` | axe-core rule ID or agent rule | `image-alt` |
| `issue_summary` | One-line description | `Image missing alternative text` |
| `element` | CSS selector or code snippet | `img.hero-banner` |
| `source_line` | Source file and line number | `src/components/Hero.tsx:42` |
| `pattern_type` | Systemic, Template, Page-specific | `Systemic` |
| `remediation_status` | New, Persistent, Fixed, Regressed | `New` |
| `fix_suggestion` | Actionable fix description | `Add descriptive alt attribute` |
| `deque_help_url` | Accessibility Insights help link | See URL patterns below |
| `wcag_url` | WCAG understanding document link | `https://www.w3.org/WAI/WCAG22/Understanding/non-text-content` |

### 2. WEB-ACCESSIBILITY-SCORECARD.csv

Summary scorecard with one row per audited page.

**Columns:**

| Column | Description | Example |
|--------|------------|---------|
| `page_url` | Audited page | `/index.html` |
| `score` | Severity score (0-100) | `72` |
| `grade` | A through F | `C` |
| `critical_count` | Number of critical issues | `0` |
| `serious_count` | Number of serious issues | `3` |
| `moderate_count` | Number of moderate issues | `5` |
| `minor_count` | Number of minor issues | `2` |
| `total_issues` | Total issue count | `10` |
| `systemic_issues` | Issues shared across all pages | `2` |
| `template_issues` | Issues from shared components | `1` |
| `page_specific_issues` | Unique to this page | `7` |
| `auto_fixable` | Number of auto-fixable issues | `4` |
| `manual_review` | Issues needing human judgment | `6` |
| `audit_date` | ISO 8601 timestamp | `2026-02-24T14:30:00Z` |
| `framework` | Detected framework | `React` |

### 3. WEB-ACCESSIBILITY-REMEDIATION.csv

Prioritized remediation plan with one row per unique issue type.

**Columns:**

| Column | Description | Example |
|--------|------------|---------|
| `priority` | Immediate, Soon, When Possible | `Immediate` |
| `rule_id` | axe-core or agent rule | `image-alt` |
| `issue_summary` | Issue description | `Images missing alt text` |
| `affected_pages` | Count of pages affected | `5` |
| `total_instances` | Total occurrences across pages | `12` |
| `pattern_type` | Systemic, Template, Page-specific | `Systemic` |
| `wcag_criteria` | WCAG success criterion | `1.1.1` |
| `severity` | Critical, Serious, Moderate, Minor | `Serious` |
| `estimated_effort` | Low, Medium, High | `Low` |
| `auto_fixable` | Yes, No, Partial | `Yes` |
| `fix_guidance` | Step-by-step fix instructions | `Add alt="description" to each img` |
| `deque_help_url` | Accessibility Insights reference | See URL patterns below |
| `wcag_url` | WCAG understanding document | URL |
| `roi_score` | Fix impact score (instances x severity weight) | `84` |

## Accessibility Insights Help URL Patterns

Map axe-core rule IDs to Accessibility Insights help pages using these URL patterns:

```text
Base URL: https://accessibilityinsights.io/info-examples/web/

Pattern: {base_url}{rule-id}
Example: https://accessibilityinsights.io/info-examples/web/image-alt/
```

**Common axe-core rule to help URL mappings:**

| axe-core Rule | Help URL | WCAG |
|---------------|---------------|------|
| `image-alt` | `https://accessibilityinsights.io/info-examples/web/image-alt/` | 1.1.1 |
| `button-name` | `https://accessibilityinsights.io/info-examples/web/button-name/` | 4.1.2 |
| `color-contrast` | `https://accessibilityinsights.io/info-examples/web/color-contrast/` | 1.4.3 |
| `label` | `https://accessibilityinsights.io/info-examples/web/label/` | 1.3.1 |
| `link-name` | `https://accessibilityinsights.io/info-examples/web/link-name/` | 4.1.2 |
| `html-has-lang` | `https://accessibilityinsights.io/info-examples/web/html-has-lang/` | 3.1.1 |
| `document-title` | `https://accessibilityinsights.io/info-examples/web/document-title/` | 2.4.2 |
| `heading-order` | `https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html` | 1.3.1 |
| `aria-roles` | `https://accessibilityinsights.io/info-examples/web/aria-roles/` | 4.1.2 |
| `aria-required-attr` | `https://accessibilityinsights.io/info-examples/web/aria-required-attr/` | 4.1.2 |
| `aria-valid-attr` | `https://accessibilityinsights.io/info-examples/web/aria-valid-attr/` | 4.1.2 |
| `bypass` | `https://accessibilityinsights.io/info-examples/web/bypass/` | 2.4.1 |
| `region` | `https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html` | 1.3.1 |
| `tabindex` | `https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html` | 2.4.3 |
| `duplicate-id` | `https://accessibilityinsights.io/info-examples/web/duplicate-id/` | 4.1.1 |
| `focus-order-semantics` | `https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html` | 2.4.3 |
| `input-image-alt` | `https://accessibilityinsights.io/info-examples/web/input-image-alt/` | 1.1.1 |
| `meta-viewport` | `https://accessibilityinsights.io/info-examples/web/meta-viewport/` | 1.4.4 |
| `select-name` | `https://accessibilityinsights.io/info-examples/web/select-name/` | 4.1.2 |
| `autocomplete-valid` | `https://accessibilityinsights.io/info-examples/web/autocomplete-valid/` | 1.3.5 |

For any axe-core rule not listed above, construct the URL as:
`https://accessibilityinsights.io/info-examples/web/{rule-id}`

For agent-detected issues without axe-core rule IDs, use W3C/WAI topic pages:

- Focus management: `https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html`
- Live regions: `https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html`
- Modal dialogs: `https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/`
- Tables: `https://www.w3.org/WAI/tutorials/tables/`
