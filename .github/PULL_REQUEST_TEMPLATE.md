## What this changes and why

<!-- One or two sentences. Link the issue it closes, if any. -->

## Accessibility checklist

Accessibility is this project's purpose. Read the contributor expectations in
[ACCESSIBILITY.md](https://github.com/Community-Access/accessibility-agents/blob/main/ACCESSIBILITY.md#contributor-expectations) and tick each
item that applies. Write N/A beside an item that does not apply.

### Checks

- [ ] `npm run verify` passes (it includes the Markdown accessibility linter and markdownlint)
- [ ] No new Markdown accessibility warnings in the files I changed

### Documentation and skill text (any change to Markdown, a skill or a report template)

- [ ] One H1 per file, and headings do not skip levels
- [ ] Link text is unique and descriptive (no "click here" or "read more")
- [ ] Images have meaningful alternative text or are marked decorative; diagrams have a text alternative nearby
- [ ] Each table has a one-sentence description before it and a header row
- [ ] Real lists, not typed numbering; code in fenced blocks with a language
- [ ] Meaning is not carried by color, position or styling alone
- [ ] Plain language; abbreviations spelled out on first use
- [ ] House style from [AGENTS.md](https://github.com/Community-Access/accessibility-agents/blob/main/AGENTS.md): no emoji, decorative Unicode or smart punctuation

### Findings and guidance (skill changes)

- [ ] Every finding has a WCAG criterion (or `n/a`), a severity, a location and a fix
- [ ] Factual claims about standards, law or tools link to a primary source, per [the citation policy](https://github.com/Community-Access/accessibility-agents/blob/main/docs/standards/citation-policy.md)
- [ ] New primary sources are added to `docs/standards/source-registry.json`

### Anything with a user interface (generated HTML, `example/`, a dashboard)

- [ ] Keyboard only: everything reachable and operable, visible focus, logical order, no keyboard trap
- [ ] Screen reader spot check: headings and landmarks, labels, states and announcements (say which screen reader and browser below)
- [ ] Text contrast 4.5:1, interface components 3:1, and targets at least 24 by 24 CSS pixels
- [ ] Reflows at 400 percent zoom and respects reduced motion
- [ ] Native elements before ARIA

### Release (only when versions or release files change)

- [ ] `npm run verify:release` passes: every manifest, `mcp-server/package.json` and `server.json` agree, and `action/README.md` pins the new version
- [ ] `CHANGELOG.md` has the matching version section, and `docs/releases/RELEASE-{version}.md` exists

## Accessibility notes

<!-- Optional: what you tested and with what (for example NVDA 2026.3 with Chrome), known limitations, or follow-up issues. -->
