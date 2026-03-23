---
name: media-accessibility
description: Video, audio, and streaming media accessibility reference. WebVTT/SRT/TTML caption formats, audio description patterns, accessible media player ARIA, WCAG 1.2.x criteria mapping, caption quality guidelines, and live captioning integration.
---

# Media Accessibility Skill

Reference data for video, audio, and streaming media accessibility. Used by `media-accessibility` agent and any web agent encountering `<video>` or `<audio>` elements.

---

## WCAG 1.2 Time-Based Media Criteria

| SC | Level | Requirement | Test |
|----|-------|-------------|------|
| 1.2.1 | A | Audio-only/video-only: provide text transcript or audio track | Transcript exists alongside media |
| 1.2.2 | A | Captions for prerecorded audio in video | Synchronized captions present |
| 1.2.3 | A | Audio description OR text alternative for prerecorded video | Description track or full transcript |
| 1.2.4 | AA | Captions for live audio in video | Real-time captioning active |
| 1.2.5 | AA | Audio description for prerecorded video | Description track present |
| 1.2.6 | AAA | Sign language for prerecorded audio | Sign language interpretation video |
| 1.2.7 | AAA | Extended audio description | Paused video for long descriptions |
| 1.2.8 | AAA | Media alternative for prerecorded video | Full text alternative document |
| 1.2.9 | AAA | Audio-only (live): text alternative | Real-time text transcript |

## Caption File Formats

### WebVTT (Web Video Text Tracks)

```
WEBVTT

00:00:01.000 --> 00:00:04.000
Welcome to the accessibility course.

00:00:04.500 --> 00:00:08.000
Today we'll cover caption best practices.

00:00:08.500 --> 00:00:12.000
<v Speaker 2>Let's start with file formats.
```

**Key rules:**
- File must start with `WEBVTT` header
- Timestamps: `HH:MM:SS.mmm --> HH:MM:SS.mmm`
- Speaker identification: `<v Speaker Name>Text`
- Maximum 2 lines per caption, 32 characters per line
- Minimum display time: 1 second
- Maximum display time: 7 seconds

### SRT (SubRip Text)

```
1
00:00:01,000 --> 00:00:04,000
Welcome to the accessibility course.

2
00:00:04,500 --> 00:00:08,000
Today we'll cover caption best practices.
```

**Key rules:**
- Sequential numbering starting at 1
- Timestamps use comma for milliseconds (not period)
- Blank line between entries
- No styling support (unlike WebVTT)

### TTML (Timed Text Markup Language)

- XML-based, used in broadcast and streaming
- Supports styling, positioning, and region layout
- IMSC (Internet Media Subtitles and Captions) is the web profile

## Caption Quality Guidelines

| Metric | Requirement |
|--------|------------|
| Accuracy | 99%+ word accuracy |
| Synchronization | Within 1 second of audio |
| Speaker identification | Required when 2+ speakers |
| Sound effects | Describe in brackets: `[applause]`, `[phone rings]` |
| Music | Describe: `[upbeat music]`, `[dramatic orchestral score]` |
| Caption rate | Maximum 200 words per minute (3 words/second) |
| Line length | Maximum 32 characters per line |
| Lines per caption | Maximum 2 lines |
| Placement | Bottom center default; move for on-screen text |

## Audio Description

Audio description narrates visual information during pauses in dialogue.

**Requirements:**
- Describe: actions, scene changes, on-screen text, facial expressions relevant to plot
- Don't describe: obvious audio cues, subjective interpretations
- Timing: fit into natural pauses; for extended descriptions (1.2.7), video pauses automatically
- Voice: distinct from program audio, clear and neutral

**HTML implementation:**
```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English" default>
  <track kind="descriptions" src="descriptions-en.vtt" srclang="en" label="English Audio Descriptions">
</video>
```

## Accessible Media Player ARIA Patterns

### Minimum Controls

Every media player must have keyboard-accessible controls for:
- Play/Pause (`role="button"`, `aria-label="Play"` / `aria-label="Pause"`)
- Volume (`role="slider"`, `aria-label="Volume"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`)
- Seek/Progress (`role="slider"`, `aria-label="Seek"`, `aria-valuetext="2 minutes 30 seconds"`)
- Captions toggle (`role="button"`, `aria-pressed`, `aria-label="Toggle captions"`)
- Fullscreen (`role="button"`, `aria-label="Enter fullscreen"` / `aria-label="Exit fullscreen"`)

### Live Region Announcements

```html
<div aria-live="polite" class="sr-only" id="player-status">
  <!-- Announce: "Playing", "Paused", "Video ended", "Captions on", "Captions off" -->
</div>
```

### Keyboard Shortcuts (Media Player Convention)

| Key | Action |
|-----|--------|
| Space / Enter | Play/Pause |
| Left Arrow | Rewind 5 seconds |
| Right Arrow | Forward 5 seconds |
| Up Arrow | Volume up |
| Down Arrow | Volume down |
| M | Mute/Unmute |
| C | Toggle captions |
| F | Toggle fullscreen |

## Transcript Best Practices

- Provide a full-text transcript adjacent to or linked from the media
- Include speaker identification, timestamps (optional but helpful), and non-speech audio
- Transcripts benefit deaf users, search engines, and users who prefer reading
- Interactive transcripts (click a line to jump to that point) are excellent UX

## Live Captioning

- WCAG 1.2.4 (AA) requires captions for live audio in synchronized media
- Options: human captioner (CART), AI-powered auto-captioning, hybrid
- AI auto-captions alone rarely meet the 99% accuracy requirement — human review or correction is recommended
- WebSocket-based caption delivery for web: push text to a `<div aria-live="polite">` container

## Common Violations

| Issue | WCAG SC | Severity |
|-------|---------|----------|
| No captions on prerecorded video | 1.2.2 | Critical |
| Auto-generated captions without review | 1.2.2 | Serious |
| No audio description for visual-only content | 1.2.5 | Serious |
| Inaccessible media player controls | 2.1.1, 4.1.2 | Critical |
| No keyboard access to play/pause | 2.1.1 | Critical |
| Autoplay without user control | 1.4.2 | Serious |
| Volume slider not keyboard-operable | 2.1.1 | Serious |
| No transcript for audio-only content | 1.2.1 | Critical |
| Captions poorly synchronized (>2s drift) | 1.2.2 | Moderate |
| Missing speaker identification in captions | 1.2.2 | Moderate |
