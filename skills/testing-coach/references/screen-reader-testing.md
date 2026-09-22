# Testing Coach reference: Screen Reader Testing

Part of the `testing-coach` skill. Read this only when the task reaches these sections.

## Screen Reader Testing

### NVDA (Windows - Free)

**Setup:**

1. Download from [nvaccess.org](https://www.nvaccess.org/download/)
2. Settings > Speech: Set rate to ~40% while learning
3. Settings > Browse Mode: Auto focus on focusable elements = ON

**Essential Commands:**

| Action | Keys |
|--------|------|
| Start/Stop speech | Ctrl |
| Read next item | Down |
| Read previous item | Up |
| Activate link/button | Enter |
| Enter forms mode | Enter (on a form field) |
| Exit forms mode | Escape |
| List all headings | NVDA+F7 then Alt+H |
| List all links | NVDA+F7 then Alt+K |
| List all landmarks | NVDA+F7 then Alt+D |
| Read current line | NVDA+L |
| Navigate by heading | H / Shift+H |
| Navigate by landmark | D / Shift+D |
| Navigate by form field | F / Shift+F |
| Navigate by button | B / Shift+B |
| Navigate by table | T / Shift+T |
| Navigate table cells | Ctrl+Alt+Arrow keys |

**NVDA key:** Insert (desktop) or Caps Lock (laptop layout)

**What to test with NVDA:**

1. Can you navigate to every interactive element?
2. Does every element announce its role, name, and state?
3. Do headings create a logical outline? (NVDA+F7 heading list)
4. Are form fields labeled? (Navigate to each, listen for the label)
5. Do error messages announce when they appear?
6. Can you complete the full user journey eyes-closed?

### VoiceOver (macOS - Built-in)

**Setup:**

1. System Settings > Accessibility > VoiceOver > Enable
2. Or press Cmd+F5 to toggle
3. VoiceOver Utility > Verbosity: Set to High while learning

**Essential Commands:**

| Action | Keys |
|--------|------|
| Toggle VoiceOver | Cmd+F5 |
| Navigate next | VO+-> (VO = Ctrl+Option) |
| Navigate previous | VO+<- |
| Activate | VO+Space |
| Read all from here | VO+A |
| Open Rotor | VO+U |
| Navigate by heading (Rotor) | VO+U then <- or -> to Headings |
| Enter web area | VO+Shift+Down |
| Exit web area | VO+Shift+Up |
| Read current item | VO+F3 |
| Navigate table cells | VO+Arrow keys |

**VoiceOver Rotor (VO+U):** The most useful testing tool. Shows lists of headings, links, landmarks, form controls, and tables. Navigate between lists with <- ->, within a list with Up Down.

**What to test with VoiceOver:**

1. Open the Rotor: Are headings logical? Are landmarks present?
2. Navigate every interactive element: Does it announce correctly?
3. Test forms: Are labels announced? Are errors announced?
4. Test modals: Does focus trap inside? Can you escape?
5. Test dynamic content: Do live regions announce updates?

### JAWS (Windows - Paid, most common enterprise screen reader)

**Essential Commands:**

| Action | Keys |
|--------|------|
| Read next line | Down |
| Read previous line | Up |
| List headings | JAWS+F6 |
| List links | JAWS+F7 |
| List form fields | JAWS+F5 |
| Enter forms mode | Enter (on form field) |
| Virtual cursor toggle | JAWS+Z |
| Navigate by heading | H / Shift+H |
| Navigate by landmark | ; / Shift+; |

**JAWS key:** Insert

### Narrator (Windows - Built-in)

Good for quick checks, not as thorough as NVDA or JAWS:

| Action | Keys |
|--------|------|
| Toggle Narrator | Win+Ctrl+Enter |
| Read next item | Caps Lock+-> |
| Read previous item | Caps Lock+<- |
| Activate | Caps Lock+Enter |
| List headings | Caps Lock+F6 |

### Testing Workflow for Any Screen Reader

Follow this sequence for every page or component:

```text
1. HEADING STRUCTURE
   - List all headings (NVDA+F7, VO Rotor, JAWS+F6)
   - Verify: Single H1, no skipped levels, logical hierarchy
   
2. LANDMARK NAVIGATION
   - List landmarks (NVDA+F7 landmarks, VO Rotor landmarks)
   - Verify: header, nav, main, footer present
   - Verify: Multiple navs have unique labels
   
3. TAB THROUGH EVERYTHING
   - Tab from top to bottom
   - Verify: Every interactive element reachable
   - Verify: Tab order matches visual layout
   - Verify: No focus traps (except modals)
   - Verify: Focus indicator visible
   
4. FORM FIELDS
   - Tab to each input
   - Verify: Label announced
   - Verify: Required state announced
   - Verify: Error messages announced on invalid submit
   - Verify: Autocomplete announced if present
   
5. INTERACTIVE COMPONENTS
   - Test every button, link, tab, accordion, dropdown
   - Verify: Role announced ("button", "link", "tab")
   - Verify: State announced ("expanded", "selected", "checked")
   - Verify: State updates announced when changed
   
6. DYNAMIC CONTENT
   - Trigger content updates (search, filter, AJAX load, toast)
   - Verify: Changes announced via live region
   - Verify: Focus managed appropriately
   
7. COMPLETE USER JOURNEY
   - Close your eyes (or turn off the monitor)
   - Complete the primary task (sign up, checkout, search)
   - Note every point of confusion or failure
```

---
