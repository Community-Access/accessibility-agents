---
name: kb-media-accessibility
description: "Reference data, not a reviewer. Video/audio accessibility: WebVTT/SRT/TTML captions, audio descriptions, accessible media player ARIA, and WCAG 1.2.x compliance."
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Media Accessibility
---

## Media Accessibility Skill

Reference data for video, audio, and streaming media accessibility. Used by `media-accessibility` agent and any web agent encountering `<video>` or `<audio>` elements.

---

## WCAG 1.2 Time-Based Media Criteria

Each SC, with its level, requirement and test.

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

```text
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
- Style-guide values (for example the DCMP Captioning Key), not WCAG requirements: maximum 2 lines per caption, about 32 characters per line, display time roughly 1 to 7 seconds

### SRT (SubRip Text)

```text
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

Each metric, with its target. These are caption style-guide and broadcast-practice targets; WCAG 1.2.2 and 1.2.4 require captions but set no numeric values.

| Metric | Target |
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

Browsers do not voice a `kind="descriptions"` text track, and screen reader support for it is limited. To meet 1.2.5 reliably, offer a version of the video with descriptions in the audio track (or a player that voices the text track), and keep the text track as a supplement.

## Accessible Media Player ARIA Patterns

### Minimum Controls

Every media player must have keyboard-accessible controls for the items below. Prefer native `<button>` and `<input type="range">`; the roles listed are for custom controls:

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

Each key, with its action.

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

Single-letter shortcuts (M, C, F) must work only while the player has focus, or be possible to turn off or remap (2.1.4 Character Key Shortcuts, A).

## Transcript Best Practices

- Provide a full-text transcript adjacent to or linked from the media
- Include speaker identification, timestamps (optional but helpful), and non-speech audio
- Transcripts benefit deaf users, search engines, and users who prefer reading
- Interactive transcripts (click a line to jump to that point) are excellent UX

## Live Captioning

- WCAG 1.2.4 (AA) requires captions for live audio in synchronized media
- Options: human captioner (CART), AI-powered auto-captioning, hybrid
- AI auto-captions alone rarely reach the 99% accuracy that caption style guides target - human review or correction is recommended
- WebSocket-based caption delivery for web: push text to a `<div aria-live="polite">` container

## Common Violations

Each issue, with its WCAG SC and severity.

| Issue | WCAG SC | Severity |
|-------|---------|----------|
| No captions on prerecorded video | 1.2.2 | critical |
| Auto-generated captions without review | 1.2.2 | serious |
| No audio description for visual-only content | 1.2.5 | serious |
| Inaccessible media player controls | 2.1.1, 4.1.2 | critical |
| No keyboard access to play/pause | 2.1.1 | critical |
| Autoplay without user control | 1.4.2 | serious |
| Volume slider not keyboard-operable | 2.1.1 | serious |
| No transcript for audio-only content | 1.2.1 | critical |
| Captions poorly synchronized (>2s drift) | 1.2.2 | moderate |
| Missing speaker identification in captions | 1.2.2 | moderate |
