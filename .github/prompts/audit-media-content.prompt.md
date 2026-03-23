---
name: audit-media-content
description: Audit video and audio elements for WCAG 1.2.x compliance — captions, audio descriptions, transcripts, media player controls, and autoplay behavior.
mode: agent
agent: media-accessibility
tools:
  - askQuestions
  - readFile
  - editFiles
  - listDirectory
  - runInTerminal
---

# Audit Media Content Accessibility

Audit video, audio, and multimedia elements for WCAG 1.2.x compliance. Checks captions, audio descriptions, transcripts, player controls, and autoplay behavior.

## Target

**File or directory:** `${input:mediaTarget}`

## Audit scope

1. **Captions** (WCAG 1.2.2, 1.2.4) — Presence, format (WebVTT/SRT), synchronization, accuracy
2. **Audio descriptions** (WCAG 1.2.3, 1.2.5) — Availability for visual-only information
3. **Transcripts** (WCAG 1.2.1, 1.2.8) — Full text alternatives for audio and video
4. **Player controls** (WCAG 2.1.1, 4.1.2) — Keyboard operable, labeled, ARIA patterns
5. **Track elements** — `<track kind="captions|descriptions|subtitles">` presence and configuration
6. **Autoplay** (WCAG 1.4.2) — Audio autoplay detection, user control mechanism

## Output

Save findings to `MEDIA-ACCESSIBILITY-AUDIT.md` with MEDIA-* rule IDs and severity scoring.
