# Text Quality Reviewer reference: Detection Rules

Part of the `text-quality-reviewer` skill. Read this only when the task reaches these sections.

## Detection Rules

### TQR-001: Template Variables in Non-Visual Text (Critical)

Detects unresolved template variable syntax in accessible names.

**Patterns detected:**

- Positional: `{0}`, `{1}`, `{2}`
- Named braces: `{{variable}}`, `{{user.name}}`
- Expression syntax: `${expression}`, `${item.title}`
- Printf-style: `%s`, `%d`, `%1$s`
- Object interpolation: `{property.name}`, `{item.altText}`
- Angular: `{{ expression }}`
- ERB/EJS: `<%= variable %>`

```html
<!-- FLAGGED: Unresolved template variable -->
<img src="hero.jpg" alt="{hero.altText}">
<button aria-label="Delete {0}">X</button>
<span aria-label="Welcome, {{username}}">Hi!</span>

<!-- FIXED: Actual text content -->
<img src="hero.jpg" alt="Mountain landscape at sunset">
<button aria-label="Delete item">X</button>
<span aria-label="Welcome, Maria">Hi!</span>
```

### TQR-002: Code Syntax in Non-Visual Text (Critical)

Detects programming language syntax used as accessible names.

**Patterns detected:**

- Dot-separated identifiers: `property.altText`, `item.description.value`
- CamelCase or PascalCase identifiers: `heroImageAlt`, `ButtonLabel`
- Snake_case identifiers: `image_alt_text`, `btn_label`
- Array/bracket syntax: `items[0]`, `data['key']`
- Function calls: `getAltText()`, `t('key')`
- HTML entities used as content: `&amp;`, `&lt;`, `&#x27;`

```html
<!-- FLAGGED: Code syntax, not human-readable text -->
<img src="product.jpg" alt="product.altText">
<img src="banner.jpg" alt="heroImageAlt">
<button aria-label="btnSubmitLabel">Go</button>

<!-- FIXED: Descriptive human-readable text -->
<img src="product.jpg" alt="Red running shoes, side view">
<img src="banner.jpg" alt="Summer sale: 30 percent off all items">
<button aria-label="Submit your order">Go</button>
```

### TQR-003: Placeholder Text as Labels (Serious)

Detects common placeholder, test, or filler text used as accessible names.

**Strings flagged (case-insensitive):**

- Development: `TODO`, `FIXME`, `TBD`, `PLACEHOLDER`, `TEMP`, `TEST`, `TESTING`
- Filler: `lorem ipsum`, `asdf`, `xxx`, `yyy`, `foo`, `bar`, `baz`, `sample`, `example text`
- Generic: `untitled`, `no title`, `none`, `N/A`, `null`, `undefined`, `empty`
- Default: `image`, `photo`, `picture`, `icon`, `logo`, `banner` (without further description)
- Repeated characters: `aaa`, `123`, `...`

```html
<!-- FLAGGED: Placeholder text -->
<img src="hero.jpg" alt="TODO">
<button aria-label="test">Submit</button>
<img src="graph.jpg" alt="placeholder">
<img src="team.jpg" alt="image">

<!-- FIXED: Meaningful descriptions -->
<img src="hero.jpg" alt="Team collaborating at a whiteboard">
<button aria-label="Submit registration form">Submit</button>
<img src="graph.jpg" alt="Quarterly revenue chart showing 15 percent growth">
<img src="team.jpg" alt="The engineering team at the 2025 offsite">
```

### TQR-004: Attribute Name as Its Own Value (Critical)

Detects when the attribute name or its role is used as the value.

**Patterns detected:**

- `alt="alt text"`, `alt="alt"`, `alt="alternative text"`
- `aria-label="aria label"`, `aria-label="ARIA Label"`, `aria-label="label"`
- `aria-label="button"`, `aria-label="link"`, `aria-label="input"`
- `title="title"`, `aria-describedby` target text that says "description"
- Button text that is just the element role: "Button", "Link", "Checkbox"

```html
<!-- FLAGGED: Attribute name used as value -->
<img src="chart.jpg" alt="alt text">
<button aria-label="ARIA Label">Click</button>
<button>Button</button>
<a href="/settings" aria-label="link">Settings</a>

<!-- FIXED: Meaningful names -->
<img src="chart.jpg" alt="Monthly active users, January through June 2025">
<button aria-label="Save document">Click</button>
<button>Save document</button>
<a href="/settings">Account settings</a>
```

### TQR-005: Empty or Whitespace-Only Accessible Names (Critical)

Detects accessible names that are present but contain no meaningful content. This is different from a missing `alt` attribute (caught by alt-text-headings). These have the attribute but it contains only whitespace, invisible characters, or zero-width spaces.

```html
<!-- FLAGGED: Present but empty/whitespace -->
<img src="important.jpg" alt=" ">
<button aria-label="   ">X</button>
<img src="chart.jpg" alt="&#8203;">  <!-- zero-width space -->

<!-- FIXED -->
<img src="important.jpg" alt="Quarterly sales comparison chart">
<button aria-label="Close dialog">X</button>
<img src="chart.jpg" alt="Revenue growth trend for Q1 2025">
```

### TQR-006: Duplicate Accessible Names on Different Controls (Serious)

Detects multiple interactive controls on the same page that share identical accessible names but perform different actions.

```html
<!-- FLAGGED: Three buttons with identical accessible names -->
<button aria-label="Delete">X</button>  <!-- deletes item 1 -->
<button aria-label="Delete">X</button>  <!-- deletes item 2 -->
<button aria-label="Delete">X</button>  <!-- deletes item 3 -->

<!-- FIXED: Unique names per action -->
<button aria-label="Delete quarterly report">X</button>
<button aria-label="Delete meeting notes">X</button>
<button aria-label="Delete project plan">X</button>
```

### TQR-007: Filename or File Path as Alt Text (Serious)

Detects file names, paths, or hashes used as image alt text.

**Patterns detected:**

- File extensions: `*.jpg`, `*.png`, `*.gif`, `*.svg`, `*.webp`, `*.avif`, `*.bmp`
- Path separators: text containing `/` or `\` followed by a filename
- CMS hash names: `DSC_0492.jpg`, `IMG_2847.jpg`, `photo-1234567890.webp`
- UUID/hash patterns: `a1b2c3d4-e5f6.png`

```html
<!-- FLAGGED: Filename as alt text -->
<img src="/uploads/DSC_0492.jpg" alt="DSC_0492.jpg">
<img src="/images/hero-banner.png" alt="hero-banner.png">
<img src="/media/photo-1234567890.webp" alt="/media/photo-1234567890.webp">

<!-- FIXED: Descriptive alt text -->
<img src="/uploads/DSC_0492.jpg" alt="Sunset over the Golden Gate Bridge">
<img src="/images/hero-banner.png" alt="Welcome to our accessible design system">
<img src="/media/photo-1234567890.webp" alt="A developer using a screen reader to test a web form">
```

### TQR-008: Single-Character or Extremely Short Labels (Moderate)

Detects accessible names that are a single character or extremely short (under 3 characters for non-icon elements).

**Exceptions (NOT flagged):**

- Icon buttons with standard single-character symbols when `aria-label` provides the full description
- Buttons with visible text like "X" when `aria-label` says "Close"
- Pagination: "1", "2", "3" when properly labeled with `aria-label`

```html
<!-- FLAGGED: Too short to be meaningful -->
<img src="info.jpg" alt="i">
<button aria-label="?">Help</button>
<td aria-label="-">No data</td>

<!-- FIXED: Descriptive names -->
<img src="info.jpg" alt="Information about this feature">
<button aria-label="Get help">Help</button>
<td aria-label="No data available">No data</td>
```

### TQR-009: Visible Text Contradicts Accessible Name (Serious)

Detects when `aria-label` or `aria-labelledby` provides an accessible name that conflicts with or does not contain the visible text. This violates WCAG 2.5.3 (Label in Name) and breaks speech-input navigation.

```html
<!-- FLAGGED: aria-label does not contain visible text "Settings" -->
<a href="/settings" aria-label="Manage your profile">Settings</a>
<!-- User says "click Settings" but the accessible name is "Manage your profile" -->

<!-- FIXED: aria-label includes visible text -->
<a href="/settings" aria-label="Settings for your account">Settings</a>
```

### TQR-010: Dynamic Content Showing Raw Data or Zero State (Moderate)

Detects patterns that suggest dynamic content failed to populate, leaving raw data structures, zero values, or default states visible as accessible names.

**Patterns detected:**

- Zero-state numbers that suggest unloaded data: "0 innings", "0 items", "$0.00" in contexts where zero makes no sense
- Raw JSON keys or API field names in visible text
- Bracket notation suggesting failed rendering: `[object Object]`, `[undefined]`

```html
<!-- FLAGGED: Suggests data did not populate -->
<span aria-label="0 innings">Score</span>
<p aria-label="[object Object]">Player stats</p>
<button>undefined</button>

<!-- FIXED: Actual content or proper loading state -->
<span aria-label="Top of the 3rd inning">Score</span>
<p aria-label="Season batting average: .312">Player stats</p>
<button>View player profile</button>
```
