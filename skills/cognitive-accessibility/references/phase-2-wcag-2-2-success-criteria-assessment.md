# Cognitive Accessibility reference: Phase 2 - WCAG 2.2 Success Criteria Assessment

Part of the `cognitive-accessibility` skill. Read this only when the task reaches these sections.

## Phase 2 - WCAG 2.2 Success Criteria Assessment

Work through each applicable success criterion. For each one, identify passing, failing, or not-applicable status and provide a finding with severity and remediation guidance.

### 2.2.1 Timing Adjustable (Level A)

Identify any time limits on content:

- Are users warned before a session timeout? (at minimum 20 seconds before expiry)
- Can users request more time - at least 10x the default, or deactivate the timeout entirely?
- Exceptions: real-time events where no alternative to the time limit is possible (such as an auction), time limits that are essential (such as a timed test), and time limits longer than 20 hours.

**Findings pattern:**

- `[FAIL]` - Session expires without warning
- `[FAIL]` - Warning shown but no way to extend
- `[WARN]` - Timeout exists but is set very short (< 5 minutes for non-financial apps)
- `[PASS]` - "Stay signed in" prompt appears with extension ability

### 2.2.2 Pause, Stop, Hide (Level A)

For any auto-updating, blinking, scrolling, or auto-advancing content:

- Is there a mechanism to pause, stop, or hide it?
- Does auto-advancing stop when the user interacts with that content?
- Blinking that lasts more than 5 seconds must have a skip/stop mechanism.

### 2.4.6 Headings and Labels (Level AA)

Are all headings and form labels descriptive?

- Heading text must describe the section - not be generic ("Details", "Info", "Section 2")
- Form labels must name what the input collects ("Date of birth", not "DOB" or "Field 1")
- Placeholder text may not serve as the label; it disappears on input

### 3.1.3 Unusual Words (Level AAA - Advisory)

Flag jargon, idioms, and technical terminology where simpler alternatives exist. Provide the plain language alternative.

### 3.1.4 Abbreviations (Level AAA - Advisory)

Every abbreviation should be expanded on first use. Flag unexpanded abbreviations.

### 3.1.5 Reading Level (Level AAA - Advisory)

The criterion asks for supplemental content or a simpler version when text needs reading ability beyond lower secondary education level. Assess reading level using the Flesch-Kincaid Grade Level formula. House targets:

- **General content:** Grade 8 or lower
- **Legal/medical content:** Grade 10 or lower (with a plain language summary at Grade 6-8)
- **Technical documentation:** Grade 12 or lower

### 3.2.3 Consistent Navigation (Level AA)

Navigation repeated across pages must appear in the same relative order and location. Flag any inconsistencies.

### 3.2.4 Consistent Identification (Level AA)

Components with the same function across pages must be identified consistently (same label, same icon, same accessible name). Flag divergences.

### 3.2.6 Consistent Help (Level A - WCAG 2.2 NEW)

If help mechanisms (human contact details, a human contact mechanism, a self-help option, or a fully automated contact mechanism such as a chatbot) are repeated on multiple pages of a set, they must occur in the same order relative to other page content, unless the user changes it. Flag a help link or chat button that moves between pages.

### 3.3.2 Labels or Instructions (Level A)

Forms must provide labels or instructions sufficient to complete the form without error:

- Required fields identified before the form is submitted (not only on validation error)
- Input format requirements shown before submission (e.g., "MM/DD/YYYY" for date fields)
- Password complexity rules shown before the user types

### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

For forms that create legal commitments, financial transactions, or modify/delete user-submitted data:

At least one of these must be true:

- Reversible: submissions can be reversed
- Checked: data entered is checked for input errors and the user can correct them
- Confirmed: the user can review, confirm and correct the information before final submission

### 3.3.7 Redundant Entry (Level A - WCAG 2.2 NEW)

In multi-step forms or wizards, information previously entered by or provided to the user that is needed again in the same process must be auto-populated or available for the user to select, except when:

- Re-entering the information is essential (for example, a memory game)
- The information is required to ensure the security of the content (e.g., confirming a new password)
- Previously entered information is no longer valid

**Finding pattern:**

- `[FAIL]` - User enters email on step 1; step 3 asks for email again with no pre-fill
- `[FAIL]` - Billing address requested again when same as shipping address was already entered
- `[PASS]` - Billing address pre-filled from shipping address with "same as above" checkbox

### 3.3.8 Accessible Authentication (Minimum) (Level AA - WCAG 2.2 NEW)

No step of an authentication process may require a cognitive function test (remembering a password, solving a puzzle, transcribing characters) unless that step provides at least one of:

- Alternative: another authentication method that does not rely on a cognitive function test
- Mechanism: a mechanism that assists the user (e.g., paste allowed, password manager autofill)
- Object recognition: the test is to recognize objects
- Personal content: the test is to identify non-text content the user provided to the site

**Finding pattern:**

- `[FAIL]` - Login form blocks password paste (prevents password manager use)
- `[FAIL]` - CAPTCHA that requires transcribing distorted text with no non-cognitive alternative (an audio CAPTCHA the user must transcribe does not count as the alternative)
- `[FAIL]` - Security question that requires exact recall of personal information
- `[PASS]` - Login supports password managers (input type="password", no paste blocking)
- `[PASS]` - CAPTCHA offers a method that is not a cognitive function test (such as a checkbox or a non-interactive check), or is an object-recognition test (allowed at AA, not at AAA)

### 3.3.9 Accessible Authentication (Enhanced) (Level AAA - Advisory)

Same as 3.3.8 but without the object recognition and personal content exceptions. Only the Alternative and Mechanism options remain.

---
