---

name: kb-mobile-accessibility
description: Reference data, not a reviewer. Audit React Native, Expo, iOS, Android for accessibility. Review accessibilityLabel, accessibilityRole, accessibilityHint, touch targets (44x44pt min), screen reader support, and platform semantics.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Mobile Accessibility
---

## Mobile Accessibility Skill

This skill provides mobile accessibility reference data for React Native, Expo, iOS, and Android auditing. Used by the `mobile-accessibility` skill.

---

## React Native Accessibility Props - Full Reference

Each prop, with its type, values or notes, WCAG SC and required. The `aria-*` props and `role` are aliases in current React Native (0.88); there is no `aria-describedby` or `aria-role`.

| Prop | Type | Values / Notes | WCAG SC | Required |
|------|------|---------------|---------|---------|
| `accessible` | boolean | `true` marks the view as an accessibility node | 4.1.2 | Conditional |
| `accessibilityLabel` | string | Human-readable name - overrides all child text | 1.1.1, 4.1.2 | Yes (all interactive + image elements) |
| `accessibilityLabelledBy` | string / string[] | Android only - references the `nativeID` of the labelling element | 1.3.1 | For form inputs |
| `accessibilityRole` | string (see roles table) | Communicates element type to AT | 4.1.2 | Yes (all interactive elements) |
| `accessibilityHint` | string | Additional context spoken after label + role | 3.3.2 | When action isn't obvious |
| `accessibilityState` | object | `{checked, disabled, expanded, selected, busy}` | 4.1.2 | State-bearing elements |
| `accessibilityValue` | object | `{min, max, now, text}` | 4.1.2 | Sliders, steppers, progress bars |
| `accessibilityActions` | array | `[{name, label}]` - defines custom actions | 2.5.1, 4.1.2 | Context menus, long-press alternatives |
| `onAccessibilityAction` | function | Handles custom action triggers | 2.5.1, 4.1.2 | Paired with `accessibilityActions` |
| `accessibilityLiveRegion` | string | Android only - `'none'` / `'polite'` / `'assertive'` | 4.1.3 | Dynamic content updates |
| `accessibilityViewIsModal` | boolean | iOS only - VoiceOver ignores sibling views | 2.4.3 | Modals, drawers, sheets |
| `accessibilityElementsHidden` | boolean | iOS - hides element and children from VoiceOver | 1.1.1 | Decorative elements |
| `importantForAccessibility` | string | Android - `'auto'` / `'yes'` / `'no'` / `'no-hide-descendants'` | 1.1.1 | Decorative / grouped elements |
| `accessibilityIgnoresInvertColors` | boolean | iOS - preserves colors in Inverted Colors mode | - | Images, video |
| `aria-label` | string | Alias for `accessibilityLabel` | 1.1.1, 4.1.2 | Preferred in new code |
| `aria-labelledby` | string | Android only - alias for `accessibilityLabelledBy` | 1.3.1 | Form inputs |
| `role` | string | Alias for `accessibilityRole` that takes ARIA role names (`button`, `heading`, `listitem`...) | 4.1.2 | All interactive elements |
| `aria-checked` | boolean / 'mixed' | RN 0.73+ alias for `accessibilityState.checked` | 4.1.2 | Checkboxes |
| `aria-disabled` | boolean | RN 0.73+ alias for `accessibilityState.disabled` | 4.1.2 | Disabled elements |
| `aria-expanded` | boolean | RN 0.73+ alias for `accessibilityState.expanded` | 4.1.2 | Accordions, dropdowns |
| `aria-selected` | boolean | RN 0.73+ alias for `accessibilityState.selected` | 4.1.2 | Tabs, list items |
| `aria-busy` | boolean | RN 0.73+ alias for `accessibilityState.busy` | 4.1.3 | Loading elements |
| `aria-hidden` | boolean | RN 0.73+ - maps to `importantForAccessibility` / `accessibilityElementsHidden` | 1.1.1 | Decorative content |
| `aria-live` | string | Android only - `'polite'` / `'assertive'` / `'off'` | 4.1.3 | Dynamic content |
| `aria-modal` | boolean | iOS only - alias for `accessibilityViewIsModal` | 2.4.3 | Modals |

### Accessibility Role Values

Each `accessibilityRole`, with the UIAccessibilityTraits value React Native sets on iOS and the class name it reports on Android (from React Native 0.88 source, RCTViewManager.m and ReactAccessibilityDelegate.kt). "None" means React Native adds no trait; the state props still apply. `accessibilityRole` has no `listitem`; the web-style `role` prop accepts `listitem` and other ARIA role names.

| Role | iOS trait | Android class | Use For |
|------|-------------|-----------------|--------|
| `'button'` | Button | android.widget.Button | Buttons, submission triggers |
| `'link'` | Link | android.view.View | Navigation links, external URLs |
| `'search'` | SearchField | android.widget.EditText | Search bars |
| `'image'` | Image | android.widget.ImageView | Images (when accessible=true) |
| `'imagebutton'` | Image + Button | android.widget.ImageButton | Icon buttons |
| `'header'` | Header | android.view.View | Headings |
| `'text'` | StaticText | android.widget.TextView | Static text |
| `'adjustable'` | Adjustable | android.widget.SeekBar | Sliders |
| `'checkbox'` | None | android.widget.CheckBox | Checkboxes |
| `'combobox'` | None | android.view.View | Dropdowns |
| `'dropdownlist'` | None | android.widget.Spinner | Dropdown lists |
| `'menu'` | None | android.view.View | Menus |
| `'menuitem'` | None | android.view.View | Menu items |
| `'menubar'` | None | android.view.View | Menu bars |
| `'progressbar'` | UpdatesFrequently | android.view.View | Progress indicators |
| `'radio'` | None | android.widget.RadioButton | Radio buttons |
| `'radiogroup'` | None | android.view.View | Radio button groups |
| `'scrollbar'` | None | android.view.View | Scrollbars |
| `'spinbutton'` | None | android.widget.SpinButton | Steppers, number inputs |
| `'switch'` | switch trait (private) | android.widget.Switch | Toggle switches |
| `'togglebutton'` | Button | android.widget.ToggleButton | Toggle buttons |
| `'tab'` | None | android.view.View | Tab elements |
| `'tablist'` | None | android.view.View | Tab containers |
| `'timer'` | None | android.view.View | Countdown timers |
| `'toolbar'` | None | android.view.View | Toolbars |
| `'grid'` | None | android.widget.GridView | Data grids |
| `'list'` | None | android.widget.AbsListView | Lists |
| `'summary'` | SummaryElement | android.view.View | Summary/status views |
| `'alert'` | None | android.view.View | Alerts |
| `'none'` | None | android.view.View | Suppress role |

---

## Touch Target Size Requirements

Each platform, with its minimum size, recommended and standard.

| Platform | Minimum Size | Recommended | Standard |
|----------|-------------|-------------|---------|
| iOS | 44 x 44 pt | 44 x 44 pt | HIG |
| Android | 48 x 48 dp | 48 x 48 dp | Material Design |
| Web mobile | 44 x 44 CSS px (AAA) | 44 x 44 CSS px | WCAG 2.5.5 |
| Web mobile (AA, 2.2) | 24 x 24 CSS px with spacing | 44 x 44 CSS px | WCAG 2.5.8 |

### Detection Pattern (React Native)

```tsx
// Violation: TouchableOpacity below minimum
const styles = StyleSheet.create({
  closeBtn: { width: 24, height: 24 },          // FAIL HIG - below 44pt (meets the 24px floor of 2.5.8)
  iconBtn: { width: 32, height: 32 },            // FAIL HIG - below 44pt
  navBtn: { padding: 4 },                        // CONDITIONAL - depends on content size
  compliant: { width: 44, height: 44 },          // PASS
  compliantWithPadding: { padding: 12 },         // PASS if content >= 20pt
});
```

---

## iOS UIAccessibility - Quick Reference

### SwiftUI Modifiers

Each modifier, with its purpose.

| Modifier | Purpose |
|----------|---------|
| `.accessibilityLabel("...")` | Overrides spoken name |
| `.accessibilityHint("...")` | Spoken usage hint (after pause) |
| `.accessibilityValue("...")` | Spoken current value |
| `.accessibilityHidden(true)` | Removes from VoiceOver tree |
| `.accessibilityElement(children: .combine)` | Merges child elements into one node |
| `.accessibilityElement(children: .contain)` | Groups children as sub-elements |
| `.accessibilityElement(children: .ignore)` | Container becomes accessible, children hidden |
| `.accessibilityAddTraits(.isButton)` | Adds role trait |
| `.accessibilityRemoveTraits(.isImage)` | Removes wrong role trait |
| `.accessibilityInputLabels(["..."])` | Voice Control activation labels |
| `.accessibilitySortPriority(n)` | Overrides VoiceOver reading order (higher = earlier) |
| `.accessibilityAction(named: "...", {})` | Custom action in the Actions rotor |
| `.accessibilityActivationPoint(CGPoint)` | Override activation tap point |
| `.accessibilityCustomContent("label", "value")` | Extra info in Accessibility Inspector |

### SwiftUI Trait Values

`isButton`, `isHeader`, `isLink`, `isImage`, `isStaticText`, `isSelected`, `isKeyboardKey`, `isSearchField`, `playsSound`, `isModal`, `updatesFrequently`, `startsMediaSession`, `allowsDirectInteraction`, `causesPageTurn`, `isTabBar`, `isSummaryElement`

### UIKit Properties

Each property, with its type and notes.

| Property | Type | Notes |
|----------|------|-------|
| `isAccessibilityElement` | Bool | Set `true` on custom views |
| `accessibilityLabel` | String? | Overrides spoken name |
| `accessibilityHint` | String? | Spoken after pause |
| `accessibilityValue` | String? | Current value (sliders, progress) |
| `accessibilityTraits` | UIAccessibilityTraits | Bitfield of traits (`.button`, `.header`, etc.) |
| `accessibilityFrame` | CGRect | Determines VoiceOver focus rect |
| `accessibilityActivate()` | func | Override activation behavior |
| `accessibilityElements` | [Any]? | Set container's VoiceOver child order |
| `shouldGroupAccessibilityChildren` | Bool | Groups all children into single node |
| `accessibilityViewIsModal` | Bool | `true` = VoiceOver trapped inside |
| `accessibilityElementsHidden` | Bool | Hides all children from VoiceOver |

---

## Android Jetpack Compose Semantics - Quick Reference

Each modifier / property, with its purpose.

| Modifier / Property | Purpose |
|--------------------|---------|
| `semantics { contentDescription = "..." }` | Accessible name |
| `semantics { role = Role.Button }` | Element role |
| `semantics { stateDescription = "..." }` | Current state text |
| `semantics { heading() }` | Marks as heading |
| `semantics { selected = true/false }` | Selected state |
| `semantics { toggleableState = ToggleableState.On }` | Toggle state |
| `semantics { onClick(label = "...", action = {...}) }` | Click action with label |
| `semantics { disabled() }` | Disabled state |
| `semantics { focused = true }` | Force focus |
| `semantics { liveRegion = LiveRegionMode.Polite }` | Live region announcements |
| `semantics { hideFromAccessibility() }` | Hide from TalkBack (replaces the deprecated `invisibleToUser()`) |
| `clearAndSetSemantics { ... }` | Replace all descendant semantics |
| `Modifier.semantics(mergeDescendants = true) { }` | Short merge pattern |

### Role Values

`Role.Button`, `Role.Checkbox`, `Role.DropdownList`, `Role.Image`, `Role.RadioButton`, `Role.Switch`, `Role.Tab`

---

## Common Violation Patterns and Fixes

### RN-001: Missing accessibilityLabel on icon button

```tsx
// VIOLATION
<TouchableOpacity onPress={close}>
  <Icon name="x" size={20} />
</TouchableOpacity>

// FIX
<TouchableOpacity
  onPress={close}
  accessibilityRole="button"
  accessibilityLabel="Close"
>
  <Icon name="x" size={20} aria-hidden />
</TouchableOpacity>
```

### RN-002: Image missing label

```tsx
// VIOLATION
<Image source={productImage} style={styles.product} />

// FIX - informational image
<Image
  source={productImage}
  style={styles.product}
  accessibilityLabel="Blue suede shoes, size 10"
/>

// FIX - decorative image
<Image
  source={decorativeBackground}
  style={styles.bg}
  accessible={false}
  importantForAccessibility="no"
/>
```

### RN-003: TextInput missing label

```tsx
// VIOLATION - placeholder is not a label
<TextInput placeholder="Email" value={email} onChangeText={setEmail} />

// FIX
<View>
  <Text nativeID="emailLabel">Email address</Text>
  <TextInput
    value={email}
    onChangeText={setEmail}
    accessibilityLabelledBy="emailLabel"
    accessibilityHint="Enter your email address"
    keyboardType="email-address"
    autoComplete="email"
  />
</View>
```

### RN-004: Checkbox missing state

```tsx
// VIOLATION
<TouchableOpacity onPress={toggle}>
  <Image source={checked ? checkedIcon : uncheckedIcon} />
  <Text>Accept terms</Text>
</TouchableOpacity>

// FIX
<TouchableOpacity
  onPress={toggle}
  accessibilityRole="checkbox"
  accessibilityState={{ checked }}
  accessibilityLabel="Accept terms and conditions"
>
  <Image source={checked ? checkedIcon : uncheckedIcon} accessible={false} />
  <Text>Accept terms</Text>
</TouchableOpacity>
```

### RN-005: Modal not trapping focus

```tsx
// VIOLATION - custom modal without VoiceOver trap
<View style={styles.modal}>
  <Text>Are you sure?</Text>
  <Button title="Confirm" onPress={confirm} />
</View>

// FIX - use the Modal component (it presents in its own window) or set
// accessibilityViewIsModal (iOS) on the container View
<Modal
  visible={visible}
  transparent
  onRequestClose={close}           // Android back button
>
  <View style={styles.overlay} accessibilityViewIsModal={true}>
    <Text>Are you sure?</Text>
    <Button title="Confirm" onPress={confirm} />
    <Button title="Cancel" onPress={close} />
  </View>
</Modal>
```

### AND-001: Compose image missing content description

```kotlin
// VIOLATION
Image(
    painter = painterResource(id = R.drawable.product),
    contentDescription = null  // null = decorative, but wrong for informational image
)

// FIX - informational
Image(
    painter = painterResource(id = R.drawable.product),
    contentDescription = stringResource(R.string.product_image_description)
)

// FIX - truly decorative
Image(
    painter = painterResource(id = R.drawable.divider),
    contentDescription = null  // null is enough for a decorative Image
)

// FIX - decorative element that is not an Image (for example a separator Text)
Text(
    text = "\u2022",
    modifier = Modifier.semantics { hideFromAccessibility() }
)
```

---

## Testing Tool Commands

### iOS Accessibility Inspector (Xcode)

```text
Xcode -> Xcode menu -> Open Developer Tool -> Accessibility Inspector
- Run audit: choose the target (Simulator or device), then use the Audit control
- Inspect: use the inspection pointer and hover over elements in Simulator
- VoiceOver is not available in Simulator; test VoiceOver on a device
```

### Android Accessibility Scanner

```bash
# Install Accessibility Scanner from Google Play (package com.google.android.apps.accessibility.auditor).
# adb install needs an APK file path, not a package name.

# Enable TalkBack via ADB (for CI)
adb shell settings put secure enabled_accessibility_services \
  com.google.android.marvin.talkback/.TalkBackService

# Check accessibility node tree
adb shell uiautomator dump /sdcard/ui_dump.xml
adb pull /sdcard/ui_dump.xml
```

### React Native Testing Library

```bash
npm install --save-dev @testing-library/react-native
```

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';

// @testing-library/react-native 14: render() and fireEvent return Promises
test('button has accessible name and role', async () => {
  await render(<SubmitButton onPress={jest.fn()} />);
  const btn = screen.getByRole('button', { name: /submit/i });
  expect(btn).toBeOnTheScreen();
});

test('checkbox updates state', async () => {
  await render(<TermsCheckbox />);
  const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
  expect(checkbox).not.toBeChecked();
  await fireEvent.press(checkbox);
  expect(checkbox).toBeChecked();
});
```

### Maestro (E2E)

```yaml
# .maestro/accessibility-checks.yaml
appId: com.example.myapp
---
- launchApp
- assertVisible:
    label: "Submit form"
- tapOn:
    label: "Close"
- assertNotVisible:
    label: "Are you sure?"
```
