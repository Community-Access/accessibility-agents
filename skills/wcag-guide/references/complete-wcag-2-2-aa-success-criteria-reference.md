# WCAG Guide reference: Complete WCAG 2.2 AA Success Criteria Reference

Part of the `wcag-guide` skill. Read this only when the task reaches these sections.

## Complete WCAG 2.2 AA Success Criteria Reference

### Principle 1: Perceivable

#### 1.1.1 Non-text Content (Level A)

**What:** All non-text content (images, icons, charts, audio) must have a text alternative.
**Why:** Screen reader users cannot see images. The text alternative conveys the same information.
**Applies to:** Images, icons, SVGs, charts, graphs, audio/video, CAPTCHA, decorative images.
**Common mistake:** Generic alt text like "image" or "photo". Alt text should describe the image's purpose in context, not just what it looks like.
**Does NOT mean:** Every image needs a description. Decorative images should have `alt=""` to be skipped.

#### 1.2.1 Audio-only and Video-only (Prerecorded) (Level A)

**What:** Prerecorded audio needs a transcript. Prerecorded video (no audio) needs a transcript or audio description.
**Why:** Deaf users can't hear audio. Blind users can't see video-only content.

#### 1.2.2 Captions (Prerecorded) (Level A)

**What:** All prerecorded video with audio must have synchronized captions.
**Why:** Deaf and hard-of-hearing users rely on captions.
**Common mistake:** Auto-generated captions without review. Auto-captions have ~85% accuracy - that 15% error rate makes content confusing.

#### 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A)

**What:** Prerecorded video must have audio description or a full text transcript.
**Why:** Blind users miss visual-only information in videos (on-screen text, demonstrations, visual gags).

#### 1.2.4 Captions (Live) (Level AA)

**What:** Live audio content in synchronized media must have captions.
**Why:** Deaf users need real-time captioning for live events.

#### 1.2.5 Audio Description (Prerecorded) (Level AA)

**What:** Audio description must be provided for prerecorded video.
**Why:** More specific than 1.2.3 - at AA level, a transcript alone is not sufficient.

#### 1.3.1 Info and Relationships (Level A)

**What:** Information, structure, and relationships conveyed visually must also be conveyed programmatically.
**Why:** Screen readers can't see visual layout. A bold heading that's just a styled `<p>` is invisible to a screen reader.
**Applies to:** Headings, lists, tables, form labels, required fields, groups of related content.
**Common mistake:** Using CSS to style text large/bold instead of using proper `<h1>`-`<h6>` elements.

#### 1.3.2 Meaningful Sequence (Level A)

**What:** When reading order matters, the DOM order must match the visual order.
**Why:** Screen readers read the DOM in source order. If CSS reorders content visually, screen reader users get a different (often confusing) sequence.

#### 1.3.3 Sensory Characteristics (Level A)

**What:** Instructions must not rely solely on shape, color, size, visual location, orientation, or sound.
**Why:** "Click the green button" means nothing to a blind user or someone with color blindness.
**Example fix:** "Click the green Submit button" -> "Click Submit" (the button's label is sufficient).

#### 1.3.4 Orientation (Level AA) - *New in 2.1*

**What:** Content must not be locked to portrait or landscape orientation unless essential.
**Why:** Some users mount their devices in a fixed orientation. A wheelchair-mounted tablet may always be in landscape.
**Exception:** A piano keyboard app may legitimately require landscape.

#### 1.3.5 Identify Input Purpose (Level AA) - *New in 2.1*

**What:** Input fields that collect user data must identify their purpose programmatically using `autocomplete` attributes.
**Why:** Allows browsers and assistive tech to auto-fill forms and present fields with icons/labels the user understands.
**Applies to:** Name, email, phone, address, credit card, birthday, and other personal data fields.
**Implementation:** `<input autocomplete="given-name">`, `<input autocomplete="email">`, etc.

#### 1.4.1 Use of Color (Level A)

**What:** Color must not be the only way to convey information.
**Why:** Color-blind users (8% of men) may not distinguish colors. Blind users can't see color at all.
**Example:** A form that shows invalid fields in red but adds no icon, text, or programmatic error message. Fix: Add an error message text and/or icon alongside the color change.

#### 1.4.2 Audio Control (Level A)

**What:** If audio plays automatically for more than 3 seconds, provide a way to pause/stop it or control volume independently.
**Why:** Background audio interferes with screen reader speech output.

#### 1.4.3 Contrast (Minimum) (Level AA)

**What:** Text must have at least 4.5:1 contrast ratio against its background. Large text (18pt or 14pt bold) requires 3:1.
**Why:** Low contrast text is hard to read for users with low vision, aging eyes, or in bright sunlight.
**Numbers to remember:** 4.5:1 for normal text. 3:1 for large text. "Large" = 18pt (24px) regular or 14pt (18.66px) bold.

#### 1.4.4 Resize Text (Level AA)

**What:** Text must be resizable up to 200% without loss of content or functionality.
**Why:** Users with low vision increase text size. If the layout breaks at 200% zoom, content becomes inaccessible.
**Common mistake:** Using fixed pixel heights on containers that clip text when it enlarges.

#### 1.4.5 Images of Text (Level AA)

**What:** Use real text instead of images of text, except for logos or decorative purposes.
**Why:** Images of text can't be resized, restyled, or read reliably by screen readers.

#### 1.4.10 Reflow (Level AA) - *New in 2.1*

**What:** Content must reflow to a single column at 320px CSS width (equivalent to 400% zoom on a 1280px screen) without horizontal scrolling.
**Why:** Users who zoom heavily should not need to scroll horizontally to read content.
**Exception:** Content that requires two-dimensional layout (data tables, images, video, toolbars, maps).

#### 1.4.11 Non-text Contrast (Level AA) - *New in 2.1*

**What:** UI components and graphical objects must have at least 3:1 contrast against adjacent colors.
**Why:** Buttons, inputs, icons, and chart elements need to be visible.
**Applies to:** Form input borders, button boundaries, icons that convey information, states (focus indicator, checked state), chart data.
**Does NOT apply to:** Inactive/disabled controls, pure decoration, logos, photos.

#### 1.4.12 Text Spacing (Level AA) - *New in 2.1*

**What:** No loss of content when users override text spacing to: line height 1.5x, paragraph spacing 2x, letter spacing 0.12em, word spacing 0.16em.
**Why:** Some users with dyslexia or low vision need increased spacing.
**Implementation:** Don't use fixed heights on text containers. Use relative units. Test by applying these overrides via browser tools or a bookmarklet.

#### 1.4.13 Content on Hover or Focus (Level AA) - *New in 2.1*

**What:** Content that appears on hover or focus (tooltips, popups) must be: dismissible (Escape hides it), hoverable (user can move pointer to the new content without it disappearing), persistent (stays visible until dismissed, focus moves, or hover ends).
**Why:** Screen magnifier users need to move their view to read hover content.

### Principle 2: Operable

#### 2.1.1 Keyboard (Level A)

**What:** All functionality must be operable via keyboard.
**Why:** Users who can't use a mouse rely on keyboard (or devices that emulate keyboard input).
**Exception:** Functions that require analog input (freehand drawing, flight simulation).

#### 2.1.2 No Keyboard Trap (Level A)

**What:** If keyboard focus enters a component, the user must be able to move focus away using only the keyboard.
**Why:** A keyboard trap makes the entire page unusable. The user is stuck.
**Exception:** Modal dialogs intentionally trap focus - but they MUST provide Escape to close.

#### 2.1.4 Character Key Shortcuts (Level A) - *New in 2.1*

**What:** If single character key shortcuts exist, users must be able to turn them off, remap them, or they must only activate on focus.
**Why:** Speech recognition users may accidentally trigger shortcuts when speaking commands.

#### 2.2.1 Timing Adjustable (Level A)

**What:** If content has a time limit, users must be able to turn off, adjust, or extend it.
**Why:** Some users need more time to read, understand, or interact.
**Exception:** Real-time events (auctions), essential time limits (exam), 20+ hour time limits.

#### 2.2.2 Pause, Stop, Hide (Level A)

**What:** Moving, blinking, scrolling, or auto-updating content must have a mechanism to pause, stop, or hide it.
**Why:** Moving content distracts users with attention disorders and makes it hard for screen reader users to read the page.

#### 2.3.1 Three Flashes or Below Threshold (Level A)

**What:** Content must not flash more than three times per second.
**Why:** Flashing content can trigger seizures in people with photosensitive epilepsy.

#### 2.4.1 Bypass Blocks (Level A)

**What:** Provide a mechanism to skip repeated blocks of content (e.g., skip navigation link).
**Why:** Keyboard users would have to Tab through the entire navigation on every page.
**Implementation:** "Skip to main content" link as the first focusable element, or proper landmark regions.

#### 2.4.2 Page Titled (Level A)

**What:** Every page must have a descriptive, unique `<title>`.
**Why:** Screen readers announce the title when a page loads. It's how users know where they are.
**Pattern:** `[Page Name] - [Site Name]` (e.g., "Checkout - Acme Store")

#### 2.4.3 Focus Order (Level A)

**What:** Focusable elements must receive focus in an order that preserves meaning and operability.
**Why:** If Tab order doesn't match the visual layout, keyboard users get lost.

#### 2.4.4 Link Purpose (In Context) (Level A)

**What:** The purpose of each link must be determined from the link text alone, or from the link text plus its context.
**Why:** "Click here" and "Read more" mean nothing out of context. Screen readers can list all links on a page - a list of ten "Read more" links is useless.

#### 2.4.5 Multiple Ways (Level AA)

**What:** Provide more than one way to find a page (e.g., navigation + search + sitemap).
**Why:** Different users prefer different navigation strategies.

#### 2.4.6 Headings and Labels (Level AA)

**What:** Headings and labels must describe the topic or purpose.
**Why:** Vague headings like "Information" or "Section 2" don't help users understand the content.

#### 2.4.7 Focus Visible (Level AA)

**What:** Keyboard focus indicator must be visible.
**Why:** Keyboard users need to see where they are. Without a visible focus indicator, keyboard navigation is like using a mouse with an invisible cursor.
**Common mistake:** `outline: none` without a replacement focus style.

#### 2.4.11 Focus Not Obscured (Minimum) (Level AA) - *New in 2.2*

**What:** When an element receives keyboard focus, it must not be entirely hidden by other content (sticky headers, modals, cookie banners).
**Why:** If the focused element is hidden behind a sticky header, the user can't see where they are.

#### 2.4.12 Focus Appearance (Level AAA) - *Note: AAA, not AA*

This is AAA, not required for AA conformance. But worth knowing: it requires focus indicators to be at least 2px thick and have 3:1 contrast.

#### 2.5.1 Pointer Gestures (Level A) - *New in 2.1*

**What:** Functionality that uses multipoint or path-based gestures (pinch, swipe, draw) must also be operable with a single-point gesture.
**Why:** Some users can only use a single finger or a head pointer.

#### 2.5.2 Pointer Cancellation (Level A) - *New in 2.1*

**What:** For single-point pointer input, at least one of: the down-event doesn't trigger the function, or the function triggers on up-event with ability to abort, or the up-event reverses the down-event.
**Why:** Users with tremors may accidentally touch targets. They need to be able to slide off before releasing.

#### 2.5.3 Label in Name (Level A) - *New in 2.1*

**What:** For UI components with visible text labels, the accessible name must contain the visible text.
**Why:** Speech recognition users say the visible label to activate controls. If the accessible name doesn't match, the command fails.
**Example problem:** Button shows "Search" visually but has `aria-label="Find products"`. A speech user saying "Click Search" gets nothing.

#### 2.5.4 Motion Actuation (Level A) - *New in 2.1*

**What:** Functions triggered by device motion (shake to undo) must also be available via UI controls, and motion triggering must be disableable.
**Why:** Users with mobility impairments may have involuntary motion. Users with mounted devices can't shake them.

#### 2.5.7 Dragging Movements (Level AA) - *New in 2.2*

**What:** Any function that uses dragging must also be achievable with a single pointer without dragging.
**Why:** Not all users can perform drag operations. Provide click-to-move, arrow keys, or other alternatives.
**Example:** A drag-to-reorder list must also have "move up"/"move down" buttons.

#### 2.5.8 Target Size (Minimum) (Level AA) - *New in 2.2*

**What:** Touch/click targets must be at least 24 x 24 CSS pixels, OR have sufficient spacing from other targets.
**Why:** Users with motor impairments, tremors, or large fingers need adequately sized targets.
**Exception:** Inline text links, targets where the size is controlled by the user agent, and essential presentations.

### Principle 3: Understandable

#### 3.1.1 Language of Page (Level A)

**What:** The default human language of the page must be programmatically identified (`<html lang="en">`).
**Why:** Screen readers use the language attribute to switch pronunciation engines.

#### 3.1.2 Language of Parts (Level AA)

**What:** The language of passages or phrases in a different language must be identified (`<span lang="fr">`).
**Why:** A French phrase in an English page should be pronounced with French pronunciation by the screen reader.

#### 3.2.1 On Focus (Level A)

**What:** Receiving focus must not trigger a change of context (page navigation, form submission, focus move).
**Why:** Users Tab to explore - unexpected changes on focus are disorienting.

#### 3.2.2 On Input (Level A)

**What:** Changing a form input value must not automatically trigger a change of context unless the user has been warned.
**Why:** A dropdown that navigates on selection is unexpected. Users should click a "Go" button.

#### 3.2.3 Consistent Navigation (Level AA)

**What:** Navigation mechanisms that appear on multiple pages must appear in the same relative order.
**Why:** Users build a mental model of the site. Rearranging navigation on different pages breaks that model.

#### 3.2.4 Consistent Identification (Level AA)

**What:** Components with the same functionality must be identified consistently (same labels, same icons).
**Why:** A search field labeled "Search" on one page and "Find" on another confuses users.

#### 3.2.6 Consistent Help (Level AA) - *New in 2.2*

**What:** If help mechanisms (contact info, chat, FAQ) appear on multiple pages, they must be in the same relative location.
**Why:** Users who need help should be able to find it reliably.

#### 3.3.1 Error Identification (Level A)

**What:** If an input error is detected, the error must be identified and described to the user in text.
**Why:** "The form has errors" is not helpful. "Email address is required" tells the user exactly what to fix.

#### 3.3.2 Labels or Instructions (Level A)

**What:** Labels or instructions are provided when content requires user input.
**Why:** Users need to know what to enter. Placeholder text is not a label - it disappears on input.

#### 3.3.3 Error Suggestion (Level AA)

**What:** If an input error is detected and suggestions are known, provide them to the user.
**Why:** "Invalid email" is less helpful than "Please enter an email address in the format <user@example.com>."

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

**What:** For legal, financial, or data-altering submissions: submissions are reversible, data is verified, or user can review/confirm before submitting.
**Why:** Mistakes on financial or legal forms can have serious consequences.

#### 3.3.7 Redundant Entry (Level A) - *New in 2.2*

**What:** Information previously provided by the user must be either auto-populated or available for selection in subsequent steps.
**Why:** Users with cognitive disabilities or motor impairments shouldn't have to re-enter information they already provided.
**Example:** If the user enters their address in step 1 of a form, step 3 should not ask for it again. Auto-populate or offer "same as shipping address."

#### 3.3.8 Accessible Authentication (Minimum) (Level AA) - *New in 2.2*

**What:** Authentication must not require cognitive function tests (remembering passwords, solving puzzles) UNLESS an alternative is provided (paste support, password managers, biometrics, passkeys).
**Why:** Users with cognitive disabilities may not be able to remember passwords or solve CAPTCHAs.
**In practice:** Support password managers (don't block paste), support passkeys/biometrics, don't use cognitive CAPTCHAs without alternatives, allow email/SMS codes.

### Principle 4: Robust

#### 4.1.2 Name, Role, Value (Level A)

**What:** All UI components must have a programmatically determinable name, role, and value. State changes must be announced to assistive technology.
**Why:** This is what makes custom components work with screen readers. A custom dropdown must announce "Dropdown, collapsed" -> "Dropdown, expanded."
**This is the most violated criterion.** It covers every custom widget that doesn't use native HTML elements.

#### 4.1.3 Status Messages (Level AA) - *New in 2.1*

**What:** Status messages (success, error, loading, search results count) must be programmatically announced without receiving focus.
**Why:** Screen reader users don't see visual notifications. Use `role="status"`, `aria-live="polite"`, or `role="alert"`.

---
