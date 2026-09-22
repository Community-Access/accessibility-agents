# media-accessibility — Media Accessibility Specialist

> Audits video, audio, and streaming media for accessibility. Covers captions (WebVTT, SRT, TTML), audio descriptions, transcripts, accessible media player controls, live captioning, and WCAG 1.2.x time-based media criteria.

## Features

- Audits prerecorded video for synchronized captions (WCAG 1.2.2)
- Checks live media for real-time captions (WCAG 1.2.4)
- Validates audio description availability for video content (WCAG 1.2.3, 1.2.5)
- Reviews transcript availability for audio-only and video content (WCAG 1.2.1)
- Audits media player controls for keyboard accessibility and ARIA patterns
- Validates caption file syntax and quality (WebVTT, SRT, TTML formats)
- Checks caption timing, accuracy, and speaker identification

## When to Use It

- Adding video or audio content to a web page
- Reviewing captions for accuracy, timing, and formatting
- Checking media player controls for keyboard and screen reader accessibility
- Ensuring audio descriptions are available for visual-only information in videos
- Auditing live streaming for real-time captioning support

## How It Works

1. **Media inventory** - Finds all `<video>`, `<audio>`, and embedded media on the page
2. **Caption audit** - Checks for `<track kind="captions">`, validates caption file syntax, and reviews quality
3. **Audio description audit** - Verifies audio descriptions exist for video content with visual-only information
4. **Transcript audit** - Checks for linked or adjacent transcripts for all media
5. **Player controls audit** - Reviews media player for keyboard operation, ARIA labels, and focus management
6. **Live media check** - Validates real-time captioning integration for live streams

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When media elements are detected during a web audit |
| Hands off to | accessibility-lead | When media review is complete and a full web audit is needed |
| Hands off to | aria-specialist | When media player ARIA patterns need deeper review |

## Sample Usage

```text
@media-accessibility Audit video captions and player controls on our course page

@media-accessibility Check if our podcast page has transcripts for all episodes

@media-accessibility Review audio description availability for our product demo videos
```

## Related

- [accessibility-lead](./accessibility-lead.md) - Coordinates full web accessibility audits
- [aria-specialist](./aria-specialist.md) - ARIA patterns for custom media player controls
- [keyboard-navigator](./keyboard-navigator.md) - Keyboard interaction for media player controls
- [live-region-controller](./live-region-controller.md) - Live region announcements for media state changes
