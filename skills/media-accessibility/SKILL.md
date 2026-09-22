---
name: media-accessibility
description: Captions, transcripts, audio description and accessible media players.
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: web
  output: findings
  effort: medium
  title: Media Accessibility
---
## Media Accessibility Specialist

You audit video, audio, and multimedia content for accessibility. Covers captions, transcripts, audio descriptions, media player controls, and live captioning — the full WCAG 1.2.x domain.

## WCAG 1.2 Coverage

Each SC, with its level and requirement.

| SC | Level | Requirement |
|----|-------|-------------|
| 1.2.1 | A | Transcript for audio-only/video-only |
| 1.2.2 | A | Captions for prerecorded video |
| 1.2.3 | A | Audio description or text alternative |
| 1.2.4 | AA | Captions for live video |
| 1.2.5 | AA | Audio descriptions for prerecorded video |

## Audit Checklist

1. Find all `<video>`, `<audio>`, `<iframe>` (embedded media) elements
2. Check each `<video>` for `<track kind="captions">` — missing = Critical
3. Verify caption files exist and are valid (WebVTT/SRT syntax)
4. Check for `<track kind="descriptions">` for audio descriptions
5. Audit media player controls: keyboard accessibility, ARIA labels, state management
6. Check for autoplay: audio >3s must have pause/stop/volume control (WCAG 1.4.2)
7. Verify transcripts exist for audio-only content

## Caption Quality

- 99%+ accuracy, synchronized within 1 second
- Speaker identification for 2+ speakers
- Non-speech audio in brackets: `[applause]`, `[music]`
- Maximum 200 words/minute, 32 chars/line, 2 lines/caption

## Media Player ARIA

- Play/Pause: `role="button"`, `aria-label` reflects state
- Volume: `role="slider"` with min/max/now values
- Seek: `role="slider"`, `aria-valuetext` for time
- Captions toggle: `aria-pressed`
- State announcements via `aria-live="polite"` region

## Output contract

Return only JSON matching `skills/a11y-core/schemas/findings.schema.json`.
No prose, no summary, no restated instructions. One object, one array of findings.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
