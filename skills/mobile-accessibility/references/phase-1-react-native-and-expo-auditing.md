# Mobile Accessibility reference: Phase 1: React Native and Expo Auditing

Part of the `mobile-accessibility` skill. Read this only when the task reaches these sections.

## Phase 1: React Native and Expo Auditing

### 1.1 Core Accessibility Props

Review every interactive element for these required props:

| Prop | Required on | Purpose | WCAG Mapping |
|------|------------|---------|-------------|
| `accessible` | Custom touchable elements | Marks element as accessible node | 1.1.1, 4.1.2 |
| `accessibilityLabel` | All interactive/informational elements | Human-readable name | 1.1.1, 4.1.2 |
| `accessibilityRole` | Interactive elements | Communicates element type to AT | 4.1.2 |
| `accessibilityHint` | Elements whose purpose isn't obvious | Extra context for screen readers | 1.3.3 |
| `accessibilityState` | Toggles, checkboxes, expandables | Communicates current state | 4.1.2 |
| `accessibilityValue` | Sliders, progress bars, steppers | Communicates current value | 1.3.1, 4.1.2 |
| `importantForAccessibility` | Android only - hides decorative elements | Filters AT tree | 1.1.1 |
| `accessibilityElementsHidden` | iOS only - hides from VoiceOver | Filters AT tree | 1.1.1 |

#### Common Role Values

```text
'none' | 'button' | 'link' | 'search' | 'image' | 'keyboardkey' |
'text' | 'adjustable' | 'imagebutton' | 'header' | 'summary' |
'alert' | 'checkbox' | 'combobox' | 'menu' | 'menubar' | 'menuitem' |
'progressbar' | 'radio' | 'radiogroup' | 'scrollbar' | 'spinbutton' |
'switch' | 'tab' | 'tablist' | 'timer' | 'toolbar' | 'grid' |
'list' | 'listitem'
```

#### ARIA Props

React Native supports these `aria-*` props as aliases (checked against the
react-native 0.88 source). It also accepts `role` as an alias of
`accessibilityRole`. There is no `aria-describedby` or `aria-role` prop;
`accessibilityHint` has no ARIA alias.

| ARIA prop | RN prop equivalent |
|-----------|-------------------|
| `aria-label` | `accessibilityLabel` |
| `aria-labelledby` | `accessibilityLabelledBy` |
| `aria-checked` | `accessibilityState.checked` |
| `aria-disabled` | `accessibilityState.disabled` |
| `aria-expanded` | `accessibilityState.expanded` |
| `aria-selected` | `accessibilityState.selected` |
| `aria-busy` | `accessibilityState.busy` |
| `aria-hidden` | `accessibilityElementsHidden` (iOS) and `importantForAccessibility="no-hide-descendants"` (Android) |
| `aria-live` | `accessibilityLiveRegion` |
| `aria-modal` | `accessibilityViewIsModal` |

### 1.2 Touch Target Size Requirements

**Minimum sizes:**

- iOS: 44 x 44 pt (points, not pixels)
- Android: 48 x 48 dp (density-independent pixels)
- WCAG 2.5.5 (AAA): 44 x 44 CSS px
- WCAG 2.5.8 (AA, 2.2): 24 x 24 CSS px minimum with sufficient spacing

**Detection pattern:** Look for `style` with `width` or `height` below threshold on `TouchableOpacity`, `TouchableHighlight`, `TouchableNativeFeedback`, `Pressable`, or any `accessible={true}` View.

**Auto-fix pattern:**

```jsx
// BEFORE: too small
<TouchableOpacity style={{ width: 24, height: 24 }}>
  <Icon name="close" size={16} />
</TouchableOpacity>

// AFTER: meets minimum
<TouchableOpacity
  style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
  accessibilityRole="button"
  accessibilityLabel="Close dialog"
>
  <Icon name="close" size={16} />
</TouchableOpacity>
```

### 1.3 Live Regions and Dynamic Content

```jsx
// Live region (React Native 0.73+ / Expo SDK 50+)
<Text aria-live="polite">
  {statusMessage}
</Text>

// Legacy equivalent
<Text accessibilityLiveRegion="polite">
  {statusMessage}
</Text>

// Values: 'none' | 'polite' | 'assertive'
```

### 1.4 Focus Management

```jsx
// Programmatic focus
import { AccessibilityInfo, findNodeHandle } from 'react-native';

const ref = useRef(null);

const focusElement = () => {
  const tag = findNodeHandle(ref.current);
  if (tag) {
    AccessibilityInfo.setAccessibilityFocus(tag);
  }
};

// After navigation / modal open - always move focus to new content
useEffect(() => {
  if (isModalOpen) focusElement();
}, [isModalOpen]);
```

### 1.5 Screen Reader Detection

```jsx
import { AccessibilityInfo } from 'react-native';

const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

useEffect(() => {
  AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
  const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
  return () => sub.remove();
}, []);
```

### 1.6 FlatList and ScrollView Patterns

```jsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, item ${index + 1} of ${items.length}`}
      onPress={() => onSelect(item)}
    >
      <Text>{item.title}</Text>
    </Pressable>
  )}
  // Required for VoiceOver swiping
  accessible={false}
/>
```

---

## Phase 2: iOS-Specific Auditing (SwiftUI and UIKit)

### 2.1 SwiftUI Accessibility Modifiers

Each modifier, with its purpose and required or conditional.

| Modifier | Purpose | Required / Conditional |
|----------|---------|----------------------|
| `.accessibilityLabel("...")` | Readable name | Required for images, icons, custom controls |
| `.accessibilityHint("...")` | Usage hint | When action isn't obvious from label |
| `.accessibilityValue("...")` | Current state/value | Sliders, steppers, progress |
| `.accessibilityAddTraits(.isButton)` | Set role traits | All interactive custom elements |
| `.accessibilityRemoveTraits(.isImage)` | Remove wrong trait | Decorative elements must remove traits |
| `.accessibilityHidden(true)` | Hide decorative elements | Separators, decorative icons |
| `.accessibilityElement(children: .combine)` | Group children | Card + label + button combinations |
| `.accessibilityInputLabels(["..."])` | Voice Control labels | When visual label differs from spoken |
| `.accessibilitySortPriority(1)` | Override reading order | Complex layouts |
| `.accessibilityAction(named: "...", { })` | Custom action | Context menus, long-press alternatives |

**Common trait values:** `.isButton`, `.isHeader`, `.isLink`, `.isImage`, `.isStaticText`, `.isSelected`, `.isKeyboardKey`, `.isSearchField`, `.playsSound`, `.isModal`, `.updatesFrequently`, `.startsMediaSession`, `.allowsDirectInteraction`, `.causesPageTurn`, `.isTabBar`

### 2.2 UIKit Patterns

```swift
// Required on every interactive, non-standard UIView
view.isAccessibilityElement = true
view.accessibilityLabel = "Submit form"
view.accessibilityTraits = [.button]
view.accessibilityHint = "Submits the payment form"

// Grouping: card with image + text + action
cardView.isAccessibilityElement = true
cardView.accessibilityLabel = "\(title), \(subtitle)"
cardView.accessibilityTraits = [.button]
// Hide children redundantly
imageView.isAccessibilityElement = false
titleLabel.isAccessibilityElement = false
```

### 2.3 VoiceOver Focus Order

Reading order follows `accessibilityFrame` positions (top-left -> bottom-right). Override with:

```swift
// UIKit - set container's accessibilityElements
containerView.accessibilityElements = [firstView, secondView, thirdView]

// SwiftUI - use accessibilitySortPriority (higher = earlier)
Text("Summary").accessibilitySortPriority(2)
Button("Details").accessibilitySortPriority(1)
```

#### One phrase, one stop

A row built from separate labels (title, subtitle, timestamp) costs one swipe
per label. When the pieces read as one phrase, make the row one accessibility
element and give it one label:

- React Native: `accessible={true}` on the container `View` groups its children
  into one element; set `accessibilityLabel` when the joined text needs a
  separator or a different order
- SwiftUI: `.accessibilityElement(children: .combine)`
- UIKit: `isAccessibilityElement = true` on the container, with the pieces
  joined in its `accessibilityLabel`
- Jetpack Compose: `Modifier.semantics(mergeDescendants = true) {}`

Group static text only. In React Native and UIKit, a control inside a grouped
row can no longer be reached on its own. For web content in a `WKWebView` or
mobile Safari, see the `aria-specialist` reference on flex and grid text runs:
flex and grid items split a phrase the same way, and white space between them
is dropped, gluing words together. Confirm with the Xcode Accessibility
Inspector, which lists the elements VoiceOver stops on.

---

## Phase 3: Android-Specific Auditing (Jetpack Compose and Views)

### 3.1 Jetpack Compose Semantics

Each modifier, with purpose and when required.

| Modifier | Purpose | When Required |
|----------|---------|--------------|
| `semantics { contentDescription = "..." }` | Accessible name | Images, icons, custom elements |
| `semantics { role = Role.Button }` | Element type | Custom interactive elements |
| `semantics { stateDescription = "..." }` | State text | Toggles, checkboxes |
| `clearAndSetSemantics { ... }` | Replace child semantics | Grouped cards, list items |
| `semantics(mergeDescendants = true) { }` | Merge hierarchy | Group text + icon into one node |
| `semantics { hideFromAccessibility() }` (replaces the deprecated `invisibleToUser()`) | Hide decorative | Separators, decorative icons |
| `FocusRequester` with `requestFocus()` | Move focus (the `focused` semantics property only reports state) | After navigation |
| `semantics { liveRegion = LiveRegion.Polite }` | Dynamic content announcements | Status messages, errors |

**Role values:** `Role.Button`, `Role.Checkbox`, `Role.DropdownList`, `Role.Image`, `Role.RadioButton`, `Role.Switch`, `Role.Tab`

```kotlin
// BEFORE: Icon button with no semantic name
IconButton(onClick = { close() }) {
    Icon(Icons.Default.Close, contentDescription = null) // BAD - null hides it
}

// AFTER: Named icon button
IconButton(
    onClick = { close() },
    modifier = Modifier.semantics { contentDescription = "Close dialog" }
) {
    Icon(Icons.Default.Close, contentDescription = null) // null OK - parent has description
}
```

### 3.2 Android Views (XML / View System)

```xml
<!-- ImageButton: always set contentDescription -->
<ImageButton
    android:contentDescription="@string/close_button"
    android:importantForAccessibility="yes" />

<!-- Decorative image: hide from TalkBack -->
<ImageView
    android:contentDescription="@null"
    android:importantForAccessibility="no" />

<!-- Group elements - parent absorbs children -->
<LinearLayout
    android:focusable="true"
    android:contentDescription="Product: Laptop, $999, Add to cart"
    android:importantForAccessibility="yes">
    <!-- children set to noHideDescendants -->
</LinearLayout>
```

### 3.3 TalkBack and Switch Access

- **TalkBack:** Uses `contentDescription`, role, and state from the accessibility node tree
- **Switch Access:** Requires focusable elements; use `android:focusable="true"` on custom views
- **Keyboard navigation:** All interactive elements must be reachable via `Tab` / D-pad

---
